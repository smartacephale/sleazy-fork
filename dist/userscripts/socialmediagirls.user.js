// ==UserScript==
// @name         Socialmediagirls PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, thumb preview
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=socialmediagirls.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://forums.socialmediagirls.com/threads/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.22/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.Rules({
    containerSelector: ".js-replyNewMessageContainer",
    paginationStrategyOptions: {
      paginationSelector: ".pageNavWrapper"
    },
    thumbs: {
      selector: "article.message"
    },
    thumb: {
      strategy: "auto-text"
    },
    thumbImg: {
      strategy: "default"
    },
    gropeStrategy: "all-in-all",
    schemeOptions: ["Title Filter", "Badge", "Advanced"]
  });

})(core);