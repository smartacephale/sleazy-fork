// ==UserScript==
// @name         NameThatPorn PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Un/Solved
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=namethatporn.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://namethatporn.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.6/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  new core.RulesGlobal({
    thumbsSelector: ".item, .nsw_r_w",
    containerSelector: "#items_wrapper, #nsw_r",
    titleSelector: ".item_title, .nsw_r_tit",
    uploaderSelector: ".item_answer b, .nsw_r_desc",
    paginationStrategyOptions: {
      paginationSelector: "#smi_wrp, #nsw_p"
    },
    customThumbDataSelectors: {
      solved: {
        type: "boolean",
        selector: ".item_solved, .nsw_r_slvd"
      }
    },
    gropeStrategy: "all-in-all",
    getThumbImgDataStrategy: "auto",
    getThumbImgDataAttrSelector: (img) => img.getAttribute("data-dyn")?.concat(".webp") || img.getAttribute("src"),
    customDataSelectorFns: [
      "filterInclude",
      "filterExclude",
      {
        filterSolved: (el, state) => state.filterSolved && el.solved
      },
      {
        filterUnsolved: (el, state) => state.filterUnsolved && !el.solved
      }
    ],
    schemeOptions: [
      "Text Filter",
      {
        title: "Filter Status",
        content: [
          { filterSolved: false, label: "solved" },
          { filterUnsolved: false, label: "unsolved" }
        ]
      },
      "Badge",
      "Advanced"
    ]
  });
  _unsafeWindow.confirm = () => true;
  function handleKeys(event) {
    if (event.key === "c") {
      const name = document.querySelector("#loggedin_box_new_username")?.innerText;
      if (!document.querySelector(`.ida_confirm_usernames a[href$="${name}.html"]`)) {
        document.querySelector(".id_answer_buttons > .iab.iac")?.click();
      }
    }
  }
  _unsafeWindow.addEventListener("keydown", handleKeys, { once: true });

})(core);