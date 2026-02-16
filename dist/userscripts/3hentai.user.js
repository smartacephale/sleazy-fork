// ==UserScript==
// @name         3Hentai PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=3hentai.net
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.3hentai.net/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@latest/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.RulesGlobal({
    containerSelectorLast: ".listing-container",
    thumbsSelector: ".doujin-col",
    titleSelector: ".title",
    getThumbImgDataStrategy: "auto",
    gropeStrategy: "all-in-all",
    customDataSelectorFns: ["filterInclude", "filterExclude"],
    schemeOptions: ["Text Filter", "Badge", "Advanced"]
  });

})(core);