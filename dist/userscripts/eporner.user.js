// ==UserScript==
// @name         Eporner PervertMonkey
// @namespace    pervertmonkey
// @version      2.0.16
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Uploader, Duration and HD, Sort by Views and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.eporner.com/*
// @match        https://*.eporner.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.21/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const show_video_prev = _unsafeWindow.show_video_prev;
  new core.Rules({
    paginationStrategyOptions: {
      paginationSelector: ".numlist2"
    },
    thumbs: { selector: "div[id^=vf][data-id]" },
    thumb: {
      selectors: {
        title: "a",
        uploader: '[title="Uploader"]',
        duration: '[title="Duration"]',
        views: { selector: '[title="Views"]', type: "float" },
        quality: { selector: '[title="Quality"]', type: "number" }
      }
    },
    thumbImg: {
      strategy: "auto",
      remove: "auto"
    },
    containerSelectorLast: "#vidresults",
    customDataFilterFns: [
      { quality360: (el, state) => !!state.quality360 && el.quality !== 360 },
      { quality480: (el, state) => !!state.quality480 && el.quality !== 480 },
      { quality720: (el, state) => !!state.quality720 && el.quality !== 720 },
      { quality1080: (el, state) => !!state.quality1080 && el.quality !== 1080 },
      { quality2k: (el, state) => !!state.quality2k && el.quality !== 2 },
      { quality4k: (el, state) => !!state.quality4k && el.quality !== 4 }
    ],
    schemeOptions: [
      "Title Filter",
      "Uploader Filter",
      "Duration Filter",
      {
        title: "Quality Filter ",
        content: [
          { quality360: false },
          { quality480: false },
          { quality720: false },
          { quality1080: false },
          { quality2k: false },
          { quality4k: false }
        ]
      },
      "Sort By",
      "Badge",
      "Advanced"
    ],
    gropeStrategy: "all-in-all",
    animatePreview
  });
  function animatePreview(doc) {
    utils.OnHover.create(doc, "div[id^=vf][data-id]", (e) => {
      const target = e;
      const thumb = target.closest("[data-id]");
      const id = thumb?.getAttribute("data-id");
      show_video_prev(id);
    });
  }

})(core, utils);