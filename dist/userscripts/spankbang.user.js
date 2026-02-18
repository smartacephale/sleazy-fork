// ==UserScript==
// @name         SpankBang.com PervertMonkey
// @namespace    pervertmonkey
// @version      4.0.1
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title and Duration
// @license      MIT
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.spankbang.com/*
// @match        https://*.spankbang.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.7/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  new core.RulesGlobal({
    containerSelector: ".main-container .js-media-list, .main_content_container .video-list",
    paginationStrategyOptions: {
      paginationSelector: ".paginate-bar, .pagination"
    },
    thumbsSelector: ".video-item:not(.clear-fix), .js-video-item",
    getThumbImgDataStrategy: "auto",
    titleSelector: "[title]",
    durationSelector: '[data-testid="video-item-length"]',
    gropeStrategy: "all-in-all",
    schemeOptions: ["Text Filter", "Duration Filter", "Badge", "Advanced"],
    animatePreview
  });
  function animatePreview(container) {
    function createPreviewElement(src) {
      return utils.parseHtml(`
    <div class="video-js vjs-controls-disabled vjs-workinghover vjs-v7 vjs-playing vjs-has-started mp4t_video-dimensions vjs-user-inactive"
        id="mp4t_video" tabindex="-1" lang="en" translate="no" role="region" aria-label="Video Player"
        style="opacity: 1;">
        <video id="mp4t_video_html5_api" class="vjs-tech" tabindex="-1" autoplay="autoplay" muted="muted" playsinline="playsinline"
                src="${src}">
        </video>
    </div>`);
    }
    function animateThumb(e) {
      const src = e.querySelector("[data-preview]")?.getAttribute("data-preview");
      const vid = createPreviewElement(src);
      e.append(vid);
      return () => {
        const v = vid.querySelector("video");
        utils.exterminateVideo(v);
        vid.remove();
      };
    }
    utils.OnHover.create(
      container,
      (e) => e.tagName === "IMG",
      (e) => {
        const target = e;
        const leaveTarget = target.closest(".thumb");
        const onOverCallback = animateThumb(leaveTarget);
        return { leaveTarget, onOverCallback };
      }
    );
  }

})(core, utils);