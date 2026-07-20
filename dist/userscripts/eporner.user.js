// ==UserScript==
// @name         Eporner PervertMonkey
// @namespace    pervertmonkey
// @version      2.1.0
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title, Uploader, Duration and HD, Sort by Views and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @homepage     https://github.com/smartacephale/sleazy-fork#readme
// @homepageURL  https://sleazyfork.org/en/users/1253342-smartacephale
// @source       https://github.com/smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.eporner.com/*
// @match        https://*.eporner.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.25/dist/core/pervertmonkey.core.umd.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

var core = window.pervertmonkey.core || pervertmonkey.core;
var utils = core;


(function (core, utils) {
  'use strict';

  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const rules = new core.Rules({
    paginationStrategyOptions: {
      paginationSelector: ".numlist2"

},
    thumbs: { selector: "div[id^=vf][data-id]" },
    thumb: {
      selectors: {
        title: "a[href*=video-]",
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
      {
        qualityFilter: {
          handle(el, state) {
            const hasAnyQualitySelected = state.quality360 || state.quality480 || state.quality720 || state.quality1080 || state.quality2k || state.quality4k;
            if (!hasAnyQualitySelected) return false;
            return !(state.quality360 && el.quality === 360 || state.quality480 && el.quality === 480 || state.quality720 && el.quality === 720 || state.quality1080 && el.quality === 1080 || state.quality2k && el.quality === 2 || state.quality4k && el.quality === 4);
          },
          deps: [
            "quality360",
            "quality480",
            "quality720",
            "quality1080",
            "quality2k",
            "quality4k"
          ]
        }
      }
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
  rules.dataManager.dataFilter.createCssFilters(
    (x) => `#panel-rightXpornstar #vidresults.showall ${x}`
  );
  function animatePreview(doc) {
    utils.OnHover.create(doc, "div[id^=vf][data-id]", (e) => {
      const thumb = e.closest("[data-id]");
      _unsafeWindow.EP.thumbs.preview.start(thumb);
    });
  }

})(core, utils);