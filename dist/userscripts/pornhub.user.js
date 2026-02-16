// ==UserScript==
// @name         PornHub PervertMonkey
// @namespace    pervertmonkey
// @version      4.0.0
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pornhub.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.pornhub.com/*
// @exclude      https://*.pornhub.com/embed/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.6/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.RulesGlobal({
    paginationStrategyOptions: {
      paginationSelector: ".paginationGated",
      overwritePaginationLast: (n) => n === 9 ? 999 : n
    },
    containerSelector: () => [...document.querySelectorAll("ul:has(> li[data-video-vkey])")].filter((e) => e.children.length > 0 && e.checkVisibility()).pop(),
    dataManagerOptions: {
      parseDataParentHomogenity: { id: true, className: true }
    },
    thumbsSelector: "li[data-video-vkey]",
    getThumbImgDataStrategy: "auto",
    getThumbImgDataAttrSelector: ["data-mediumthumb", "data-image"],
    uploaderSelector: ".usernameWrap",
    titleSelector: "span.title",
    durationSelector: ".duration",
    gropeStrategy: "all-in-all",
    schemeOptions: ["Text Filter", "Duration Filter", "Badge", "Advanced"]
  });
  function bypassAgeVerification() {
    document.querySelectorAll('[data-label="over18_enter"]').forEach((b) => {
      b.click();
    });
    setTimeout(() => {
      cookieStore.set({
        name: "accessAgeDisclaimerPH",
        value: "2",
        expires: Date.now() + 90 * 24 * 60 * 60 * 1e3
      });
    }, 1e3);
  }
  bypassAgeVerification();

})(core);