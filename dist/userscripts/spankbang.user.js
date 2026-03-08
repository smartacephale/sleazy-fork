// ==UserScript==
// @name         SpankBang.com PervertMonkey
// @namespace    pervertmonkey
// @version      4.0.12
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title and Duration. Sort by Duration and Views
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spankbang.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.spankbang.com/*
// @match        https://*.spankbang.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.19/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.Rules({
    containerSelector: ".main-container .js-media-list, .main_content_container .video-list",
    paginationStrategyOptions: {
      paginationSelector: ".paginate-bar, .pagination"
    },
    thumbs: { selector: ".video-item:not(.clear-fix), .js-video-item" },
    thumb: {
      selectors: {
        title: "[title]",
        duration: '[data-testid="video-item-length"]',
views: { selector: '[data-testid="views"]', type: "float" },
        quality: { selector: '[data-testid="video-item-resolution"]', type: "string" }
      }
    },
    thumbImg: { strategy: "auto" },
    gropeStrategy: "all-in-all",
    customDataFilterFns: [
      { qualityLow: (e, state) => !!state.qualityLow && e.quality !== "" },
      { qualityHD: (e, state) => !!state.qualityHD && e.quality !== "HD" },
      { quality4k: (e, state) => !!state.quality4k && e.quality !== "4K" }
    ],
    schemeOptions: [
      "Title Filter",
      "Duration Filter",
      {
        title: "Quality Filter",
        content: [
          { qualityLow: false, label: "Low" },
          { qualityHD: false, label: "HD" },
          { quality4k: false, label: "4K" }
        ]
      },
      "Sort By",
      "Badge",
      "Advanced"
    ]
  });

})(core);