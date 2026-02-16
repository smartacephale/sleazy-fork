// ==UserScript==
// @name         XVideos Improved
// @namespace    pervertmonkey
// @version      4.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xvideos.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.6/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const xv = _unsafeWindow.xv;
  new core.RulesGlobal({
    paginationStrategyOptions: {
      paginationSelector: "#main .pagination:last-child",
      searchParamSelector: "p"
    },
    containerSelector: "#content > div",
    thumbsSelector: "div.thumb-block[id^=video_]:not(.thumb-ad)",
    titleSelector: "[class*=title]",
    uploaderSelector: "[class*=name]",
    durationSelector: "[class*=duration]",
    gropeStrategy: "all-in-one",
    customDataSelectorFns: ["filterInclude", "filterExclude"],
    schemeOptions: ["Text Filter", "Duration Filter", "Badge", "Advanced"],
    animatePreview,
    getThumbDataCallback(thumb) {
      setTimeout(() => {
        const id = parseInt(thumb.getAttribute("data-id"));
        xv.thumbs.prepareVideo(id);
      }, 200);
    }
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
      return src.replace(/thumbs169l{1,}/, "videopreview").replace(/\/\w+\.\d+\.\w+/, "_169.mp4").replace(/(-\d+)_169\.mp4/, (_, b) => `_169${b}.mp4`);
    }
    utils.onPointerOverAndLeave(
      container,
      (target) => target.tagName === "IMG" && target.id.includes("pic_"),
      (target) => {
        const videoSrc = getVideoURL(target.src);
        const onOverCallback = createPreviewElement(videoSrc, target);
        const leaveTarget = target.closest(".thumb-inside");
        return { leaveTarget, onOverCallback };
      }
    );
  }

})(core, utils);