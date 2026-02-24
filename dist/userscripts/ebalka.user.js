// ==UserScript==
// @name         Ebalka PervertMonkey
// @namespace    pervertmonkey
// @version      3.0.2
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ebalka.zip
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://b.ebalka.zip/*
// @match        https://a.ebalka.love/*
// @match        https://*ebalka.*.*/*
// @match        https://*.ebalk*.*/*
// @match        https://*.fuckingbear*.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.11/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  new core.Rules({
    containerSelectorLast: ".content__video",
    paginationStrategyOptions: {
      paginationSelector: ".pagination:not([id *= member])"
    },
    thumbs: {
      selector: ".card_video"
    },
    thumb: {
      selectors: {
        title: ".card__title",
        duration: ".card__spot > span:last-child"
      }
    },
    animatePreview,
    schemeOptions: ["Text Filter", "Badge", "Duration Filter", "Advanced"]
  });
  function animatePreview(container) {
    function animateThumb(thumb) {
      const el = thumb.querySelector(".card__thumb_video");
      el.classList.toggle("video-on");
      const src = el.querySelector(".card__image")?.getAttribute("data-preview");
      const videoElem = utils.parseHtml(`<video style="position: absolute; left: 0px; top: 0px; visibility: visible; margin-top: -1px;"
      autoplay="" loop="" playsinline="true" webkit-playsinline="true" src="${src}"></video>`);
      el.appendChild(videoElem);
      return () => {
        el.classList.toggle("video-on");
        utils.exterminateVideo(videoElem);
      };
    }
    utils.OnHover.create(
      container,
      (target) => target.tagName === "IMG",
      (target) => {
        const thumb = target.closest(".card");
        const onOverCallback = animateThumb(thumb);
        return { leaveTarget: thumb, onOverCallback };
      }
    );
  }

})(core, utils);