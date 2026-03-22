// ==UserScript==
// @name         Missav PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.18
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration, Sort by Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=missav123.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.missav123.com/*
// @match        https://*.missav.*/*
// @match        https://*.missav.ws/*
// @match        https://*.missav.to/*
// @match        https://*.missav.live/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.25/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.Rules({
    paginationStrategyOptions: {
      paginationSelector: "nav[x-data]"
    },
    containerSelector: ".grid[x-data]",
    thumbs: { selector: "div:has(> .thumbnail.group)" },
    thumb: { strategy: "auto-text" },
    thumbImg: { strategy: "auto" },
    schemeOptions: [
      "Title Filter",
      "Duration Filter",
      "Sort By Duration",
      "Badge",
      "Advanced"
    ]
  });

})(core);