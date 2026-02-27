// ==UserScript==
// @name         3Hentai PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.4
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=3hentai.net
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.3hentai.net/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.13/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  new core.Rules({
    containerSelectorLast: ".listing-container",
    thumbs: {
      selector: ".doujin-col"
    },
    thumb: {
      selectors: {
        title: ".title"
      }
    },
    thumbImg: {
      strategy: "auto"
    },
    gropeStrategy: "all-in-all",
    customDataSelectorFns: ["filterInclude", "filterExclude"],
    schemeOptions: ["Text Filter", "Badge", "Advanced"],
    animatePreview
  });
  function animatePreview() {
    const tick = new utils.Tick(500, false);
    const end = 9999;
    function rotate(src) {
      return src.replace(/(\d+)(?=t\.jpg$)/, (_, n) => `${utils.circularShift(parseInt(n), end)}`);
    }
    utils.OnHover.create(document.body, ".doujin-col", (e) => {
      const img = e.querySelector("img");
      const origin = img.src;
      img.src = img.src.replace(/\w+\.\w+$/, "1t.jpg");
      img.onerror = (_) => tick.stop();
      tick.start(
        () => {
          img.src = rotate(img.src);
        },
        () => {
          img.src = origin;
        }
      );
      return () => tick.stop();
    });
  }

})(core, utils);