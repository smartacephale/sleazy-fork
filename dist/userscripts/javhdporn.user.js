// ==UserScript==
// @name         Javhdporn PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.4
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javhdporn.net
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.javhdporn.net/*
// @match        https://*.javhdporn.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.13/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.Rules({
    containerSelector: "div:has(> article)",
    thumbs: { selector: "article.thumb-block" },
    thumb: {
      selectors: {
        title: "header.entry-header",
        duration: ".duration"
      }
    },
    paginationStrategyOptions: {
      pathnameSelector: /\/page\/(\d+)\/?$/
    },
    schemeOptions: ["Text Filter", "Badge", "Duration Filter", "Advanced"]
  });

})(core);