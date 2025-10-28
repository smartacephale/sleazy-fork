// ==UserScript==
// @name         XHamster Improved
// @namespace    http://tampermonkey.net/
// @version      4.0.1
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases. Automatically expand more videos on video page.
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xhamster.*/*
// @match        https://*.xhamster.com/*
// @exclude      https://*.xhamster.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xhamster.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.meta.js
// ==/UserScript==

const {
  getAllUniqueParents,
  watchElementChildrenCount,
  waitForElementExists,
  timeToSeconds,
  exterminateVideo,
  Observer,
  sanitizeStr,
  DataManager,
  createInfiniteScroller,
  getPaginationStrategy
} = window.bhutils;
const {
  JabroniOutfitStore,
  defaultStateWithDurationAndPrivacy,
  JabroniOutfitUI,
  defaultSchemeWithPrivacyFilter,
} = window.jabronioutfit;

if (window.top !== window.self) return;

if (!/^(\w{2}.)?xhamster.(com|desi)/.test(window.location.host)) throw new Error('whatever');

const LOGO = `
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡘⢲⣃⢖⡚⡴⢣⡞⠰⠁⡀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢮⡵⣫⣝⡳⠏⢠⢃⡐⠁⡘⢀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⡀⠀⡀⠀⠀⠀⠀⢀⠐⡀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠔⡉⢃⡉⠓⡈⢃⠊⡐⠡⡐⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠠⠐⠀⠄⠐⠀⡐⠀⠠⠁⡀⢁⠀⠂⠄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠂⡔⢢⡐⢣⡜⢤⠣⡜⡰⢀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠠⠐⠀⠠⠐⡈⠄⡈⠐⡀⠌⢀⠐⠀⠄⡈⢂⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠦⡙⣌⠣⡜⢣⡚⡥⣛⠴⣡⠃⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠐⠈⢀⠐⠈⡐⠠⠐⠠⢀⠡⠐⡀⠂⠌⡐⠠⢐⠡⢈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠈⡐⠠⣉⠖⡱⢌⠳⣌⢣⡑⠦⠡⢏⡴⣉⠂⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠈⠀⠐⠀⠠⢁⠀⢂⠁⠂⠄⠂⡁⠄⢁⠂⠄⡁⢢⠘⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠈⠆⢀⠰⣀⠣⢔⡩⢜⢪⡱⢂⠇⡌⢣⠁⡞⣰⠡⢂⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠁⠂⠈⠀⠀⠈⡀⠌⠐⠈⠐⠀⠈⠄⢀⠂⠐⡀⢊⠡⠀⠀⠀⠀⠀⠀⠀⠀⠠⡈⢆⡹⠀⢂⢅⠢⣍⠒⡜⣬⠣⣕⠫⡜⢠⠃⢰⠩⡖⡑⢂⠀⡀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⢀⠀⠈⠀⠄⠀⠄⠂⢀⠈⠀⠀⠀⠀⠁⡀⠣⢘⠀⠀⠀⠀⠀⠀⠀⠄⡑⠌⢢⠐⡡⢌⡊⠵⡨⠝⢲⡤⡛⣌⠳⣈⠆⠡⢈⠳⣌⡑⢂⠠⠀⠂⠀⢀⠀⠀⢄⡀⡠⠀⠄⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⡀⠀⢈⠀⠂⠁⡀⠠⠀⡀⢈⢄⡒⡔⣢⢔⢣⢆⢆⠤⣠⢀⡀⣀⠬⣰⠜⣎⢧⢯⡵⣫⣜⣳⣙⣎⢧⡒⡥⢌⡱⢀⠂⠁⢈⠱⡰⢌⠂⠤⢑⡈⢅⠢⢌⡑⢆⠱⣡⠋⡔⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⢀⠐⠀⢀⠂⢀⠀⡄⢒⡌⠶⣘⠶⣙⢦⣛⢮⡞⣎⡗⣦⠓⡴⣡⢟⣵⡻⣽⡞⣷⢯⣗⣻⢶⣫⡞⣶⡹⣜⣣⢖⡡⢆⡀⢀⠃⠖⡨⠐⣈⠦⡘⢤⠣⠜⡌⣌⠢⢱⡘⠄⠐⠈
 ⠀⠀⠀⠀⠀⠀⠈⠀⠀⠐⠀⢀⠢⣘⠰⣃⠞⣵⢫⡟⣽⣺⢽⣮⡝⡾⡼⣉⢾⣱⢯⣟⡾⣽⣳⢿⣽⣻⢾⣽⣳⢯⣽⣳⢯⣳⢳⣎⡗⢮⡐⢆⡉⢒⠡⠀⢖⡰⢉⢆⠣⣍⠲⣀⠣⣁⠎⠄⠀⢀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢆⡱⢌⡳⢭⡞⣭⢷⣻⢷⣯⣟⡾⣽⣳⡱⣝⡮⣟⣽⢾⣻⣽⣟⣯⣷⣿⣻⣾⣽⣻⡾⣽⢯⣟⡷⣞⡽⢮⣝⠲⣌⠢⢁⠂⠥⢊⡕⣊⠱⣂⠓⡄⠣⡔⡈⠀⠀⢀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣍⠲⣘⢮⡱⣏⡾⣽⢯⣟⣿⣾⡽⣿⡳⢧⡳⣝⡾⣽⢯⣿⣟⣯⣿⣿⣻⣾⣟⣷⣿⢯⣿⢯⣿⢾⣽⣻⣞⡷⣎⢿⡰⣃⠆⡈⢰⢣⡘⢤⠓⣌⢣⠐⡡⢒⠀⠁⠀⢈
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⡘⠤⣃⠳⣎⣳⣭⢿⣽⣻⡾⣿⣟⣿⢻⣝⡣⡝⣮⢿⣽⣻⣯⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⢿⣻⣯⣿⣞⣷⣻⣼⣛⡮⣵⢣⡚⢄⠘⢆⡙⢦⡙⢤⠃⢎⠡⠆⡌⠀⠀⠠
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡴⣉⠗⣎⢷⣚⡿⣞⣷⣻⢷⡯⣝⠳⣪⠵⡹⣜⣻⢾⣽⣻⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣟⣷⡿⣾⣳⣟⣞⣳⡽⣲⢣⡝⢢⠌⡠⢈⠂⠝⣢⠹⣌⠱⢌⠄⠀⠁⠀
 ⢣⠜⡄⢦⢀⠤⢂⠔⠀⠑⡰⢡⡛⣬⢳⢯⡽⣻⡼⢯⣳⠽⡌⢯⡔⣫⢷⡸⣝⠿⣞⡿⣯⣿⣿⡿⣿⣿⢿⣿⣽⣷⣿⣿⣻⣽⡷⣟⡾⣝⣧⢻⡱⢇⡞⡡⢎⠔⡡⢌⡐⠠⠑⠌⡱⢈⠤⠈⠄⣀
 ⣂⠎⡰⢢⠍⢆⠃⢠⢩⡔⣮⠱⡸⣌⢗⣫⢞⡵⣻⢏⡧⣏⡽⣌⠲⣭⢖⡧⣫⢟⡽⣻⡽⣷⣻⢿⣻⣽⡿⣯⣿⢯⣷⣿⣻⣽⣻⣽⣛⠷⣎⠷⣙⠮⣜⡱⣊⡜⣡⠒⣌⠱⠈⠄⠡⢂⠒⡌⢰⠀
 ⢍⡶⣙⢦⡙⢆⠈⣴⢣⡿⣜⡷⣥⠊⢞⡰⢫⡜⣣⠏⠶⣡⢛⡼⣛⠶⡹⢶⡙⣎⠷⣹⣝⣳⢯⣟⣯⢷⣻⢯⣟⡿⣽⣞⣯⢷⡻⢮⡹⡹⣌⠯⣕⡫⢖⣱⢱⡘⠤⠋⣄⢢⢡⠊⡔⣈⠱⡌⢃⠜
 ⡟⡴⣋⠶⣙⡎⢲⣭⢿⣽⢻⡼⣣⠙⠢⣅⠣⣜⠰⣉⠖⡡⢉⠖⡥⢋⡓⢧⡙⢦⡙⠰⢪⠕⣏⠾⣜⠯⣝⢯⡞⣽⢣⠟⣬⣳⣟⣿⣳⢷⡩⢞⡱⣭⢋⡖⠣⡌⣥⢫⡔⣣⢎⡱⠒⡄⢆⠘⡂⠥
 ⢿⣱⣏⡖⣣⠜⣱⢮⡷⣫⣟⡵⡃⢀⡁⠆⠓⡌⠳⠌⢎⠡⠃⠎⠐⢩⢌⣃⠹⣂⠡⠓⠤⢊⠜⡸⢌⡳⣍⠶⣙⢦⡛⣞⣳⣟⡾⣷⣟⣧⢻⣭⣓⡌⢧⡜⢧⡹⣆⡳⣙⢦⢋⠴⡉⠔⡈⢰⡉⢇
 ⢯⠷⣞⣳⢬⠸⣭⢷⡻⣵⢺⡝⣁⢾⡸⣝⢶⡲⣕⠶⣎⢷⣫⢞⡽⡬⣤⢌⣣⣘⢤⡥⣆⡖⡤⣥⣀⡑⠨⠚⠥⢎⢵⣫⢷⣯⣿⣟⣾⡭⢷⣞⣧⡻⣥⢛⢧⣛⡴⢣⡍⢦⡉⢆⢁⣂⢠⢃⡜⢤
 ⣳⢻⡜⣣⢎⡱⣏⢾⡳⣭⢷⡚⢬⡷⣻⡼⣧⣟⢮⣟⢮⣳⣝⡮⢷⡽⢮⣟⡶⣭⢷⣻⡼⣝⣳⡵⣫⢽⡻⢶⣞⣤⠸⣝⣯⡷⣿⣻⢾⣽⣻⡾⣽⣳⢎⡝⡎⠶⣩⠇⣜⡰⡜⣸⠲⡌⣆⠣⡜⢢
 ⡷⣋⠾⣥⢫⡴⢫⢧⡛⣭⠾⡽⣣⠻⣵⢻⡵⣞⣟⡾⣏⡷⡾⣽⣛⣾⢻⣼⢻⣭⢷⣳⢟⣭⢷⡻⣝⣾⡹⢷⣎⢯⣽⣻⣞⣿⣳⢯⣟⡾⣣⣟⣷⡻⢎⡰⣉⠳⣤⢛⠴⡣⣕⢣⠣⡝⢤⠓⣍⠆
 ⣭⠳⣙⠶⡩⢎⠅⡻⣜⢦⣋⠷⣩⠗⣎⢯⣽⢫⡾⡽⣽⣹⢟⣵⡻⢮⡟⣾⣹⢮⡟⣽⠾⣭⡟⣽⣫⢶⡛⢯⡴⣻⣞⡷⣯⢷⢫⢟⣼⣳⢓⡾⡱⡝⣢⠕⣎⡳⢬⣋⢞⡱⡜⢪⡕⡜⢢⡙⢤⡉
 ⢦⡙⡜⢢⠓⣌⢚⡱⣌⠳⣎⠳⣍⡛⣜⡘⡮⢏⡷⣻⢵⣫⢟⡼⣹⠯⣝⢶⢫⡗⣯⠝⢯⠳⡝⢣⢍⠲⣙⠮⡵⣛⡼⡹⢎⢇⡫⡞⡵⣃⠷⣜⢣⡝⢦⡛⡴⡙⢦⡉⢦⠓⣌⠣⠜⡨⢅⡘⠤⣈
 ⢆⠰⢈⠆⠱⣀⠣⢒⠌⡓⡌⠳⢄⠹⢤⠓⡘⢭⠲⡱⢎⠶⣩⠚⡥⢛⡌⢎⡱⠚⣄⢋⠆⡣⢉⠖⡨⠣⢍⠚⠥⢓⠬⡑⢎⠲⠱⣙⠲⣉⠞⣌⠣⢎⡱⢜⠲⣉⠦⡙⢦⡙⠤⢓⡘⣐⠢⢌⡐⢀
 ⢀⠂⠡⢈⠐⠠⠑⣈⠢⠑⡈⢁⠊⡐⠂⠉⠜⡀⠣⠑⠊⠆⡅⢋⠔⠡⠘⠠⠂⠑⠀⡈⠀⠁⡀⢀⠀⢁⠀⠌⠠⢁⠂⠡⢈⠰⠁⢂⠡⠐⠈⠄⡉⢂⠱⢈⠱⢈⠒⠩⡐⠌⡑⠌⠰⢀⠃⠂⠄⢃
 ⢀⠈⠄⠂⠈⠄⠡⠀⠄⠁⡀⠂⠀⠀⠀⠀⠀⠀⠁⠈⡐⠠⠀⠂⠐⠠⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠂⠐⠠⠈⠐⢀⠂⠐⠈⡐⠀⡈⠐⠈⠀`;

class XHAMSTER_RULES {
  IS_VIDEO_PAGE = /^\/videos|moments\//.test(location.pathname);
  IS_PLAYLIST = /^\/my\/favorites\/videos\/\w+/.test(location.pathname);

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.prev-next-list, .test-pager'
  });

  handlePlaylistPagination = () => {
    // const { collectionId } = unsafeWindow.initials.favoritesContentComponent;
    this.paginationStrategy = getPaginationStrategy({ paginationSelector: 'nav[class *= "pagination"]' });
    Object.assign(this.paginationStrategy, {
      getPaginationLast: () => unsafeWindow.initials.favoritesVideoPaging.maxPages,
      getPaginationOffset: () => unsafeWindow.initials.favoritesVideoPaging.active,
      getPaginationUrlGenerator: () => (offset) => {
        this.container = document.querySelector('.thumb-list');
        const c2 = this.container.cloneNode(true)
        unsafeWindow.DM_.parseData(c2);
        // const url = `https://xhamster.com/api/front/favorite/get-playlist?id=${collectionId}&perPage=60&page=${offset}`;
        document.querySelector('.prev-next-list-button:last-child > button').click();
        //console.log(unsafeWindow.DM_);
        return location.href;
      }
    });
  }

  container = [...document.querySelectorAll('.thumb-list')].pop();

  isPrivate(thumb) {
    return !!thumb.querySelector('[data-role="video-watched');
  }

  getThumbs(html) {
    return html.querySelectorAll('.video-thumb');
  }

  getThumbUrl(thumb) {
    return thumb.firstElementChild.href;
  }

  getThumbImgData(thumb) {
    if (store?.localState.pagIndexCur === 1) return {};
    const img = thumb.querySelector('img[loading]');
    if (img) img.removeAttribute('loading');
    if (!img?.complete || img.naturalWidth === 0) return {};
    return { img, imgSrc: img.src };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(
      thumb.querySelector('.video-thumb-info__name,.video-thumb-info>a')?.innerText,
    );
    const duration = timeToSeconds(
      thumb.querySelector('.thumb-image-container__duration')?.innerText,
    );
    return { title, duration };
  }
}

const RULES = new XHAMSTER_RULES();

//====================================================================================================

function expandMoreVideoPage() {
  waitForElementExists(document.body, 'button[data-role="show-more-next"]', (el) => {
    const observer = new Observer((target) => target.click());
    observer.observe(el);
  });
}

//====================================================================================================

function createPreviewVideoElement(src, mount) {
  const video = document.createElement('video');
  video.playsinline = true;
  video.autoplay = true;
  video.loop = true;
  video.classList.add('thumb-image-container__video');
  video.src = src;
  video.addEventListener(
    'loadeddata',
    () => {
      mount.before(video);
    },
    false,
  );
  const stop = () => exterminateVideo(video);
  return { stop };
}

function handleThumbHover(e) {
  if (!e.target.classList.contains('thumb-image-container__image')) return;
  const videoSrc = e.target.parentElement.getAttribute('data-previewvideo');
  const { stop } = createPreviewVideoElement(videoSrc, e.target);
  e.target.parentElement.parentElement.addEventListener('mouseleave', stop, { once: true });
}

function animate() {
  document.body.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function parseInPLace() {
  const containers = getAllUniqueParents(RULES.getThumbs(document.body));
  containers.forEach((c) => { parseData(c, c, false, false) });
}

function route() {
  animate();

  if (RULES.IS_VIDEO_PAGE) {
    expandMoreVideoPage();
    watchElementChildrenCount(RULES.container, () => setTimeout(parseInPLace, 1800));
  }

  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  if (RULES.IS_PLAYLIST) {
    waitForElementExists(document.body, 'nav[class *= "pagination"]', () => {
      RULES.handlePlaylistPagination();
      createInfiniteScroller(store, parseData, RULES);
    });
  }

  parseInPLace();
  setTimeout(parseInPLace, 500);

  new JabroniOutfitUI(store, defaultSchemeWithPrivacyFilter);
}

defaultSchemeWithPrivacyFilter.privacyFilter = [
  { type: 'checkbox', model: 'state.filterPrivate', label: 'unwatched' },
  { type: 'checkbox', model: 'state.filterPublic', label: 'watched' },
];

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const DM_ = new DataManager(RULES, store.state);
const { applyFilters, parseData } = DM_;
Object.assign(unsafeWindow, { DM_ });
store.subscribe(applyFilters);
route();
