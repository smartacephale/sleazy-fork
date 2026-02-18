// ==UserScript==
// @name         Motherless PervertMonkey
// @namespace    pervertmonkey
// @version      5.0.1
// @author       violent-orangutan
// @description  Infinite scroll [optional], Filter by Title and Duration
// @license      MIT
// @homepage     https://github.com/smartacephale/sleazy-fork
// @homepageURL  https://github.com/smartacephale/sleazy-fork
// @source       github:smartacephale/sleazy-fork
// @supportURL   https://github.com/smartacephale/sleazy-fork/issues
// @match        https://motherless.com/*
// @require      https://cdn.jsdelivr.net/npm/pervert-monkey@1.0.7/dist/core/pervertmonkey.core.umd.js
// @require      data:application/javascript,var core = window.pervertmonkey.core || pervertmonkey.core; var utils = core;
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function (core, utils) {
  'use strict';

  var _GM_addStyle = (() => typeof GM_addStyle != "undefined" ? GM_addStyle : undefined)();
  var _unsafeWindow = (() => typeof unsafeWindow != "undefined" ? unsafeWindow : undefined)();

  _unsafeWindow.__is_premium = true;
  const $ = _unsafeWindow.$;
  const rules = new core.RulesGlobal({
    containerSelectorLast: ".content-inner",
    thumbsSelector: ".thumb-container, .mobile-thumb",
    uploaderSelector: ".uploader",
    titleSelector: ".title",
    durationSelector: ".size",
    getThumbImgDataStrategy: "auto",
    paginationStrategyOptions: {
      paginationSelector: ".pagination_link, .ml-pagination"
    },
    animatePreview,
    gropeStrategy: "all-in-all",
    schemeOptions: ["Text Filter", "Duration Filter", "Badge", "Advanced"]
  });
  function animatePreview(_) {
    const ANIMATION_INTERVAL = 500;
    const tick = new utils.Tick(ANIMATION_INTERVAL);
    let currentOverlay = null;
    function onLeave(target) {
      tick.stop();
      const img = target.querySelector("img.static");
      img.classList.remove("animating");
      if (currentOverlay) {
        currentOverlay.style.display = "none";
      }
    }
    function onOver(target) {
      $(".video").off();
      const container = target.closest(".desktop-thumb.video");
      const img = container.querySelector("img.static");
      const stripSrc = img.getAttribute("data-strip-src");
      img.classList.add("animating");
      let overlay = img.nextElementSibling;
      if (!overlay || overlay.tagName !== "DIV") {
        overlay = document.createElement("div");
        overlay.setAttribute(
          "style",
          "z-index: 8; position: absolute; top: 0; left: 0; pointer-events: none;"
        );
        img.parentNode?.insertBefore(overlay, img.nextSibling);
      }
      currentOverlay = overlay;
      overlay.style.display = "block";
      let j = 0;
      const containerHeight = container.offsetHeight;
      tick.start(() => {
        const w = img.offsetWidth;
        const h = img.offsetHeight;
        const widthRatio = Math.floor(1000.303 * w / 100);
        const heightRatio = Math.floor(228.6666 * h / 100);
        const verticalOffset = (containerHeight - h) / 2;
        Object.assign(overlay.style, {
          width: `${w}px`,
          height: `${containerHeight}px`,
          backgroundImage: `url('${stripSrc}')`,
          backgroundSize: `${widthRatio}px ${heightRatio}px`,
          backgroundPosition: `-${j++ * w % widthRatio}px ${verticalOffset}px`,
          backgroundRepeat: "no-repeat"
        });
      });
      const onOverCallback = () => onLeave(container);
      return { onOverCallback, leaveTarget: container };
    }
    utils.OnHover.create(
      document.body,
      (e) => {
        const container = e.closest(".desktop-thumb.video");
        if (!container) return false;
        const img = container.querySelector("img.static");
        if (!img) return false;
        const stripSrc = img.getAttribute("data-strip-src");
        if (!stripSrc || img.classList.contains("animating")) return false;
        return true;
      },
      onOver
    );
  }
  function fixURLs() {
    document.querySelectorAll(".gallery-container").forEach((g) => {
      const x = g.innerText.match(/([\d|.]+)k? videos/gi)?.[0];
      const hasVideos = parseInt(x) > 0;
      const header = hasVideos ? "/GV" : "/GI";
      g.querySelectorAll("a").forEach((a) => {
        a.href = a.href.replace(/\/G/, () => header);
      });
    });
    document.querySelectorAll('a[href^="/term/"]:not([href^="/term/videos/"])').forEach((a) => {
      a.href = a.href.replace(
        /[\w|+]+$/,
        (v) => `videos/${v}?term=${v}&range=0&size=0&sort=date`
      );
    });
    document.querySelectorAll('#media-groups-container a[href^="/g/"]').forEach((a) => {
      a.href = a.href.replace(/\/g\//, "/gv/");
    });
  }
  function mobileGalleryToDesktop(e) {
    e.querySelector(".clear-left")?.remove();
    const container = e.firstElementChild;
    container.appendChild(container.nextElementSibling);
    e.className = "thumb-container gallery-container";
    container.className = "desktop-thumb image medium";
    (container.firstElementChild?.nextElementSibling).className = "gallery-captions";
    utils.replaceElementTag(container.firstElementChild, "a");
    return e;
  }
  async function desktopAddMobGalleries() {
    const galleries = document.querySelector(".media-related-galleries");
    if (!galleries) return;
    const galleriesContainer = galleries.querySelector(".content-inner");
    const galleriesCount = galleries.querySelectorAll(".gallery-container").length;
    const mobDom = await utils.fetchWith(window.location.href, { type: "html", mobile: true });
    const mobGalleries = mobDom.querySelectorAll(
      ".ml-gallery-thumb"
    );
    for (const [i, x] of mobGalleries.entries()) {
      if (i > galleriesCount - 1) {
        galleriesContainer.append(mobileGalleryToDesktop(x));
      }
    }
  }
  const overwrite1 = (x) => `@media only screen and (max-width: 1280px) {
  #categories-page.inner ${x} }`;
  rules.dataManager.dataFilter.applyCSSFilters(overwrite1);
  _GM_addStyle(`
.img-container, .desktop-thumb { min-height: 150px; max-height: 150px; }

.group-minibio, .gallery-container { display: block !important; }

.ml-masonry-images.masonry-columns-4 .content-inner { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.ml-masonry-images.masonry-columns-6 .content-inner { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
.ml-masonry-images.masonry-columns-8 .content-inner { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); }
`);
  function applySearchFilters() {
    let pathname = window.location.pathname;
    const wordsToFilter = rules.store.state.filterExcludeWords.replace(/f:/g, "").match(/(?<!user:)\b\w+\b(?!\s*:)/g) || [];
    wordsToFilter.filter((w) => !pathname.includes(w)).forEach((w) => {
      pathname += `+-${w.trim()}`;
    });
    if (wordsToFilter.some((w) => !window.location.href.includes(w))) {
      window.location.href = pathname;
    }
  }
  desktopAddMobGalleries().then(() => fixURLs());
  const IS_SEARCH = /^\/term\//.test(location.pathname);
  if (IS_SEARCH) {
    applySearchFilters();
  }

})(core, utils);