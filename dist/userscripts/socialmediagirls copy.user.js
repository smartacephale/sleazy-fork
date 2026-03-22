// ==UserScript==
// @name         Socialmediagirls PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.4
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=socialmediagirls.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://forums.socialmediagirls.com/threads/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.25/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function (core) {
  'use strict';

  new core.Rules({
    containerSelector: ".js-replyNewMessageContainer",
    paginationStrategyOptions: {
      paginationSelector: ".block-container + * .pageNav",
      pathnameSelector: /\/page-(\d+)\/?$/
    },
    thumbs: {
      selector: "article.message"
    },
    thumb: {
      strategy: "auto-text",
      getUrlSelector: "a[href*=threads]"
    },
    gropeStrategy: "all-in-all",
    schemeOptions: ["Title Filter", "Badge", "Advanced"]
  });

})(core);