// ==UserScript==
// @name         Xhamster Improved
// @namespace    pervertmonkey
// @version      5.0.4
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xhamster.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://*.xhamster.com/*
// @match        https://*.xhamster.*/*
// @exclude      https://*.xhamster.com/embed*
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
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const IS_VIDEO_PAGE = /^\/videos|moments\//.test(location.pathname);
  const IS_PLAYLIST = /^\/my\/favorites\/videos\/\w+/.test(location.pathname);
  function createThumb(data) {
    const attrsToReplace = {
      href: data.pageURL,
      "data-previewvideo": data.trailerURL,
      "data-previewvideo-fallback": data.trailerFallbackUrl,
      "data-sprite": data.spriteURL,
      title: data.title,
      "data-video-id": data.id,
      srcset: data.thumbURL,
      src: data.imageURL
    };
    const text = {
      ".video-thumb-views": data.views,
      "[title]": data.title,
      '[data-role="video-duration"] div': data.duration
    };
    return utils.instantiateTemplate(".video-thumb", attrsToReplace, text);
  }
  const getPaginationData = !IS_PLAYLIST ? void 0 : async (url) => {
    const data = await utils.fetchJson(url);
    const thumbsHtml = data.list.map((e) => createThumb(e)).join("\n");
    return utils.parseHtml(`<div>${thumbsHtml}</div>`);
  };
  function createPlaylistPaginationStrategy() {
    const collectionId = location.pathname.split("/my/favorites/videos/")[1].split("-")[0];
    const data = _unsafeWindow.initials;
    const paginationLast = data.favoritesVideoPaging.maxPages;
    const paginationOffset = data.favoritesVideoPaging.active;
    const playlistPaginationStrategy = {
      paginationSelector: 'nav[class *= "pagination"]',
      getPaginationLast: () => paginationLast,
      getPaginationOffset: () => paginationOffset,
      getPaginationUrlGenerator: () => (offset) => {
        return `https://xhamster.com/api/front/favorite/get-playlist?id=${collectionId}&perPage=60&page=${offset}`;
      }
    };
    return playlistPaginationStrategy;
  }
  const paginationStrategyOptionsDefault = {
    paginationSelector: ".prev-next-list, .test-pager"
  };
  const paginationStrategyOptions = IS_PLAYLIST ? createPlaylistPaginationStrategy() : paginationStrategyOptionsDefault;
  const rules = new core.Rules({
    paginationStrategyOptions,
    getPaginationData,
    containerSelectorLast: ".thumb-list",
    thumbs: { selector: ".video-thumb" },
    thumb: {
      selectors: {
        title: ".video-thumb-info__name,.video-thumb-info>a",
        duration: ".thumb-image-container__duration",
        watched: {
          type: "boolean",
          selector: '[data-role="video-watched'
        }
      }
    },
    thumbImg: {
      strategy: "auto",
      remove: "[loading]"
    },
    gropeStrategy: "all-in-all",
    customDataSelectorFns: [
      "filterInclude",
      "filterExclude",
      "filterDuration",
      {
        filterWatched: (el, state) => !!(state.filterWatched && el.watched)
      },
      {
        filterUnwatched: (el, state) => !!(state.filterUnwatched && !el.watched)
      }
    ],
    schemeOptions: [
      "Text Filter",
      "Badge",
      {
        title: "Filter Watched",
        content: [
          { filterWatched: false, label: "watched" },
          { filterUnwatched: false, label: "unwatched" }
        ]
      },
      "Duration Filter",
      "Advanced"
    ],
    animatePreview
  });
  function animatePreview() {
    function createPreviewVideoElement(src, mount) {
      const video = _GM_addElement("video", {
        playsInline: true,
        autoplay: true,
        loop: true,
        class: "thumb-image-container__video",
        src
      });
      video.addEventListener(
        "loadeddata",
        () => {
          mount.before(video);
        },
        false
      );
      return () => utils.exterminateVideo(video);
    }
    utils.OnHover.create(document.body, ".video-thumb", (e) => {
      const container = e.querySelector(".thumb-image-container__image");
      const videoSrc = e.querySelector("[data-previewvideo]")?.getAttribute("data-previewvideo");
      console.log(container, videoSrc);
      return createPreviewVideoElement(videoSrc, container);
    });
  }
  function expandMoreVideoPage() {
    utils.watchElementChildrenCount(rules.container, () => setTimeout(rules.gropeInit, 1800));
    utils.waitForElementToAppear(document.body, 'button[data-role="show-more-next"]', (el) => {
      const observer = new utils.Observer((target) => {
        target.click();
      });
      observer.observe(el);
    });
  }
  if (IS_VIDEO_PAGE) {
    expandMoreVideoPage();
  }

})(core, utils);