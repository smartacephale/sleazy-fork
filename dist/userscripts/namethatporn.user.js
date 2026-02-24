// ==UserScript==
// @name         NameThatPorn PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.2
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Un/Solved
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=namethatporn.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://namethatporn.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.11/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  new core.Rules({
    thumbs: { selector: ".item, .nsw_r_w" },
    containerSelector: "#items_wrapper, #nsw_r",
    thumb: {
      selectors: {
        title: ".item_title, .nsw_r_tit",
        uploader: ".item_answer b, .nsw_r_desc",
        solved: {
          type: "boolean",
          selector: ".item_solved, .nsw_r_slvd"
        }
      }
    },
    thumbImg: {
      selector: (img) => {
        return img.getAttribute("data-dyn")?.concat(".webp") || img.getAttribute("src");
      }
    },
    paginationStrategyOptions: {
      paginationSelector: "#smi_wrp, #nsw_p"
    },
    gropeStrategy: "all-in-all",
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