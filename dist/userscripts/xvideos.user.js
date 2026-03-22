// ==UserScript==
// @name         XVideos PervertMonkey
// @namespace    pervertmonkey
// @version      4.0.22
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Uploader and Duration. Sort by Duration and Views.
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xvideos.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.25/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const xv = _unsafeWindow.xv;
  new core.Rules({
    paginationStrategyOptions: {
      paginationSelector: "#main .pagination:last-child",
      searchParamSelector: "p"
    },
    containerSelector: "*:has(>div.thumb-block[id^=video_]:not(.thumb-ad))",
    thumbs: { selector: "div.thumb-block[id^=video_]:not(.thumb-ad)" },
    thumb: {
      selectors: {
        title: "[class*=title]",
        uploader: "[class*=name]",
        duration: "[class*=duration]",
        views: { selector: ".metadata a ~ span", type: "float" },
        quality: { selector: ".video-hd-mark", type: "string" }
      },
      callback: (thumb) => {
        setTimeout(() => {
          const id = parseInt(thumb.getAttribute("data-id"));
          xv.thumbs.prepareVideo(id);
        }, 200);
      }
    },
    customDataFilterFns: [
      { qualityLow: (e, state) => !!state.qualityLow && e.quality !== "" },
      { quality360: (e, state) => !!state.quality360 && e.quality !== "360p" },
      { quality720: (e, state) => !!state.quality720 && e.quality !== "720p" },
      { quality1080: (e, state) => !!state.quality1080 && e.quality !== "1080p" },
      { quality1440: (e, state) => !!state.quality1440 && e.quality !== "1440p" },
      { quality4k: (e, state) => !!state.quality4k && e.quality !== "4k" }
    ],
    schemeOptions: [
      "Title Filter",
      "Uploader Filter",
      "Duration Filter",
      {
        title: "Quality Filter",
        content: [
          { qualityLow: false, label: "Low" },
          { quality360: false, label: "360p" },
          { quality720: false, label: "720p" },
          { quality1080: false, label: "1080p" },
          { quality1440: false, label: "1440p" },
          { quality4k: false, label: "4k" }
        ]
      },
      "Sort By",
      "Badge",
      "Advanced"
    ],
    animatePreview
  });
  function animatePreview(container) {
    function createPreviewElement(src, mount) {
      const elem = utils.parseHtml(`
    <div class="videopv" style="display: none;">
        <video autoplay="autoplay" playsinline="playsinline" muted="muted"></video>
    </div>`);
      mount.after(elem);
      const video = elem.querySelector("video");
      video.src = src;
      video.addEventListener(
        "loadeddata",
        () => {
          mount.style.opacity = "0";
          elem.style.display = "block";
          elem.style.background = "#000";
        },
        false
      );
      return () => {
        utils.exterminateVideo(video);
        elem.remove();
        mount.style.opacity = "1";
      };
    }
    function getVideoURL(src) {
      return src.replace(/\w+\.\w+$/, () => "preview.mp4");
    }
    utils.OnHover.create(container, "div.thumb-block[id^=video_]:not(.thumb-ad)", (target) => {
      const img = target.querySelector("img");
      const videoSrc = getVideoURL(img.src);
      return createPreviewElement(videoSrc, img);
    });
  }

})(core, utils);