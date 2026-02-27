// ==UserScript==
// @name         Erome PervertMonkey
// @namespace    pervertmonkey
// @version      5.0.3
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Video/Photo albums
// @license      MIT
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erome.com
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        *://*.erome.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.13/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core) {
  'use strict';

  var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : undefined)();
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  const $ = _unsafeWindow.$;
  const rules = new core.Rules({
    containerSelector: "#albums",
    gropeStrategy: "all-in-one",
    thumbs: {
      selector: "div[id^=album-]"
    },
    thumb: {
      selectors: {
        title: ".album-title",
        uploader: ".album-user",
        videoAlbum: { type: "boolean", selector: ".album-videos" }
      }
    },
    storeOptions: { showPhotos: true },
    customDataSelectorFns: [
      "filterInclude",
      "filterExclude",
      {
        filterPhotoAlbums: (el, state) => state.filterPhotoAlbums && !el.videoAlbum
      },
      {
        filterVideoAlbums: (el, state) => state.filterVideoAlbums && el.videoAlbum
      }
    ],
    schemeOptions: [
      "Text Filter",
      {
        title: "Filter Albums",
        content: [
          {
            filterVideoAlbums: false,
            label: "video albums"
          },
          {
            filterPhotoAlbums: false,
            label: "photo albums"
          }
        ]
      },
      "Badge",
      "Advanced"
    ]
  });
  rules.infiniteScroller?.subject.subscribe(() => {
    setTimeout(() => new LazyLoad(), 100);
  });
  _GM_addStyle(`
.inactive-gm { background: #a09f9d; }
.active-gm { background: #eb6395 !important; }
`);
  (function disableDisclaimer() {
    if (!$("#disclaimer").length) return;
    $.ajax({ type: "POST", url: "/user/disclaimer", async: true });
    $("#disclaimer").remove();
    $("body").css("overflow", "visible");
  })();
  const IS_ALBUM_PAGE = /^\/a\//.test(window.location.pathname);
  function togglePhotoElements() {
    $(".media-group > div:last-child:not(.video)").toggle(rules.store.state.showPhotos);
    $("#togglePhotos").toggleClass("active-gm", rules.store.state.showPhotos);
    $("#togglePhotos").text(!rules.store.state.showPhotos ? "show photos" : "hide photos");
  }
  function setupAlbumPage() {
    $("#user_name").parent().append(
      '<button id="togglePhotos" class="btn btn-pink inactive-gm">show/hide photos</button>'
    );
    $("#togglePhotos").on("click", () => {
      rules.store.state.showPhotos = !rules.store.state.showPhotos;
    });
    rules.store.stateSubject.subscribe(() => {
      togglePhotoElements();
    });
    togglePhotoElements();
  }
  if (IS_ALBUM_PAGE) {
    setupAlbumPage();
  }

})(core);