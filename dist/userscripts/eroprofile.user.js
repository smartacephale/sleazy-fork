// ==UserScript==
// @name         Eroprofile PervertMonkey
// @namespace    pervertmonkey
// @version      2.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eroprofile.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.eroprofile.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@latest/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  document.querySelector(".videoGrid")?.after(document.querySelector(".clB"));
  new core.RulesGlobal({
    paginationStrategyOptions: {
      paginationSelector: ".boxNav2",
      searchParamSelector: "pnum"
    },
    titleSelector: "[title]",
    durationSelector: ".videoDur",
    containerSelector: ".videoGrid",
    thumbsSelector: ".video",
    customDataSelectorFns: ["filterInclude", "filterExclude", "filterDuration"],
    schemeOptions: [
      "Text Filter",
      "Duration Filter",
      {
        title: "Sort By ",
        content: [
          {
            "sort by duration": () => {
            }
          }
        ]
      },
      "Badge",
      "Advanced"
    ]
  });

})(core);