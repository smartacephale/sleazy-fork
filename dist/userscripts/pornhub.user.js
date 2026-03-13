// ==UserScript==
// @name         PornHub PervertMonkey
// @namespace    pervertmonkey
// @version      4.0.15
// @author       violent-orangutan
// @description  Infinite scroll [optional]. Filter by Title, Uploader and Duration. Sort by Duration and Views
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pornhub.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.pornhub.com/*
// @exclude      https://*.pornhub.com/embed/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.22/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  new core.Rules({
    paginationStrategyOptions: {
      paginationSelector: ".paginationGated",
      overwritePaginationLast: (n) => n === 9 ? 9999 : n
    },
    containerSelector: () => [...document.querySelectorAll("ul:has(> li[data-video-vkey])")].filter((e) => e.children.length > 0 && e.checkVisibility()).sort((a, b) => b.children.length - a.children.length)?.[0],
    containerHomogenity: { id: true, className: true },
    thumbs: { selector: "li[data-video-vkey]" },
    thumb: {
      selectors: {
        title: "span.title",
        uploader: ".usernameWrap",
        duration: ".duration",
        views: { selector: ".views", type: "float" }
      }
    },
    thumbImg: {
      selector: ["data-mediumthumb", "data-image"]
    },
    gropeStrategy: "all-in-all",
    schemeOptions: [
      "Title Filter",
      "Uploader Filter",
      "Duration Filter",
      "Sort By",
      "Badge",
      "Advanced"
    ]
  });
  function bypassAgeVerification() {
    cookieStore.set({
      name: "accessAgeDisclaimerPH",
      value: "2",
      expires: Date.now() + 90 * 24 * 60 * 60 * 1e3
    });
    document.querySelectorAll('[data-label="over18_enter"]').forEach((b) => {
      b.click();
    });
  }
  bypassAgeVerification();

})(core);