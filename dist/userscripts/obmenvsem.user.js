// ==UserScript==
// @name         Obmensvem PervertMonkey
// @namespace    pervertmonkey
// @version      1.0.3
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=obmenvsem.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.obmenvsem.com/*
// @match        https://*.obmenvsem.*/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.13/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  var _GM_addElement = (() => typeof GM_addElement != "undefined" ? GM_addElement : undefined)();
  var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : undefined)();

  const IS_USER_FILES = location.pathname.startsWith("/user_files");
  const IS_VIDEO_PAGE = /info.php\?id=\d+$/.test(location.href);
  const SEARCH_PARAM = IS_USER_FILES ? "start" : "page";
  function setup() {
    const container = document.createElement("div");
    container.classList.add("container");
    container.append(
      ...document.querySelectorAll(".item:has(> a.block[href *= info] > img)")
    );
    document.querySelector(".c2")?.after(container);
    if (!IS_VIDEO_PAGE) {
      _GM_addStyle("a.block[href *= info] > img:first-child { height: 240px; }");
    }
    if (IS_VIDEO_PAGE) {
      const vidh = document.querySelector("a[href*=mp4]");
      vidh?.after(
        _GM_addElement("video", {
          src: vidh.href,
          controls: true,
          width: vidh.parentElement?.offsetWidth
        })
      );
    }
  }
  setup();
  new core.Rules({
    paginationStrategyOptions: {
      getPaginationUrlGenerator() {
        const url = utils.parseUrl(location.href);
        return (offset) => {
          const offsetValue = IS_USER_FILES ? offset * 24 : offset;
          url.searchParams.set(SEARCH_PARAM, offsetValue.toString());
          return url.href;
        };
      },
      overwritePaginationLast: () => 9999,
      searchParamSelector: "page",
      paginationSelector: ".item.pages, .pagination"
    },
    containerSelectorLast: ".container",
    thumbs: { selector: ".item:has(> a.block[href *= info] > img)" },
    thumb: { strategy: "auto-text" },
    thumbImg: {
      selector: (img) => {
        const url = img.closest("a").href;
        utils.fetchHtml(url).then((dom) => {
          img.src = dom.querySelector("img[src*=attach]")?.src || img.src;
        });
        return img.src;
      }
    },
    schemeOptions: ["Text Filter", "Duration Filter", "Badge", "Advanced"]
  });

})(core, utils);