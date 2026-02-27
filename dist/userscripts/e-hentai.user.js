// ==UserScript==
// @name         E-Hentai PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.2
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=e-hentai.org
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.e-hentai.org/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.13/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  new core.Rules({
    thumbs: { selector: ".gl1t" },
    thumb: {
      selectors: {
        title: ".glname"
      }
    },
    thumbImg: {
      selector: "data-lazy-load"
    },
    containerSelectorLast: ".itg.gld",
    paginationStrategyOptions: createPaginationStrategyOptions(),
    customDataSelectorFns: ["filterInclude", "filterExclude"],
    schemeOptions: ["Text Filter", "Badge", "Advanced"]
  });
  function createPaginationStrategyOptions() {
    let nextLink;
    function getPaginationUrlGenerator() {
      function getNextLink(doc = document) {
        return [...doc.querySelectorAll("a#dnext[href]")].pop()?.href;
      }
      const paginationUrlGenerator = async (_) => {
        if (!nextLink) {
          nextLink = getNextLink();
          return nextLink;
        }
        const doc = await utils.fetchHtml(nextLink);
        nextLink = getNextLink(doc);
        return nextLink;
      };
      return paginationUrlGenerator;
    }
    return {
      paginationSelector: ".searchnav + div + .searchnav",
      overwritePaginationLast: () => 9999999,
      getPaginationUrlGenerator
    };
  }
  function setThumbnailMode() {
    const IS_SEARCH_PAGE = /f_search/.test(location.search) || /^\/tag\//.test(location.pathname);
    if (!IS_SEARCH_PAGE) return;
    const selectInputT = document.querySelector("option[value=t]");
    if (selectInputT) {
      const select = selectInputT.parentElement;
      if (select.value === "t") return;
      select.value = "t";
      select.dispatchEvent(new Event("change"));
    }
  }
  setThumbnailMode();

})(core, utils);