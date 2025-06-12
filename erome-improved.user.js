// ==UserScript==
// @name         Erome Improved
// @namespace    http://tampermonkey.net/
// @version      3.0.6
// @license      MIT
// @description  Infinite scroll. Filter photo/video albums. Toggle photos in albums. Skips 18+ dialog
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        *://*.erome.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erome.com
// @run-at       document-idle
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.6/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @downloadURL https://update.sleazyfork.org/scripts/492883/Erome%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/492883/Erome%20Improved.meta.js
// ==/UserScript==
/* globals $ LazyLoad */

const { parseDom, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDurationAndPrivacy, JabroniOutfitUI, defaultSchemeWithPrivateFilter } = window.jabronioutfit;

const LOGO = `
⡝⣝⢝⢝⢝⢝⢝⢝⢍⠭⡩⢍⠭⡩⡍⡭⢍⠭⡍⡭⡙⡍⢏⢝⠩⡩⡋⡍⡏⡝⡝⡽⡹⡹⡹⡙⡝⡙⡝⢍⠭⡩⢍⠭⡩⡩⡩⡩⡩⡍⡭⡩⡍⣍⢫⡩⡹⡩⡹⡩
⡱⡱⡕⡇⣏⢎⢮⣪⢪⡪⣪⢪⡪⣪⢪⡪⣪⡪⡪⡢⡣⢪⢢⡣⡑⢌⠆⡪⡪⡪⡚⡜⢜⢸⠨⡊⡎⢎⢮⢣⠯⢮⠳⡝⡼⡪⢮⢣⠳⡕⠵⡕⠧⡳⢕⠧⡫⠮⡳⡹
⢕⢝⡜⡎⣎⢧⢓⢎⠇⠕⢅⠣⡩⡘⡌⡎⡆⢇⠕⡕⢅⢇⢷⢱⢘⢔⢅⢇⢕⢅⠇⡪⢨⢂⠣⡱⡘⢜⢌⢎⢎⠢⡃⠕⡌⢌⢢⠡⡱⢘⠌⡢⢃⢊⢢⢑⢌⢊⢆⠪
⢳⢱⢕⢝⢜⢜⢎⢇⢇⠣⡡⢱⢐⢅⢇⠎⢜⠰⡑⡜⢜⠜⡜⡜⡌⡺⡵⡣⢣⢑⢌⠢⡑⡐⡑⠔⢅⠣⡊⡆⢇⡳⡘⢌⠌⢆⠆⡃⡊⡢⡑⢌⠢⡑⢅⠆⡕⢌⢢⠱
⡱⡣⡳⡹⡸⡱⡕⣕⢅⠕⢌⢆⢇⠣⢅⠣⡑⢅⢊⠌⡢⡑⡕⡕⡧⡣⣏⠎⢜⠰⡐⡡⠂⢌⠢⢑⠅⢕⢑⠜⡌⡎⢎⢇⢕⢑⢌⠪⡐⡌⢌⠆⡣⢡⠱⡨⡂⡣⠪⡘
⡝⣜⢕⢝⡜⣕⢕⢕⢢⢑⢕⠜⡌⢎⠪⡨⠨⢂⠢⠨⡐⢌⠆⡇⡯⣺⠸⡈⢎⢪⢐⢐⠡⠡⡈⠢⠡⡑⢌⢪⢘⢌⢎⢎⢎⢆⠥⡑⡌⡌⠆⢕⢌⠢⡑⢔⢌⢪⢘⢌
⢪⢎⢮⢣⡣⡇⡗⡝⢔⢅⢇⢕⢑⢅⠕⠌⢌⠢⠨⢂⠪⡐⢕⢕⢝⢜⠅⡊⢜⢔⢕⢐⢅⢑⠨⡈⡊⢌⢢⢑⢅⢣⠪⡢⡣⡳⡹⡸⡲⣘⢌⠢⡂⡣⢊⠢⡱⢨⠢⡱
⡣⡳⣱⢣⡣⡳⣱⢹⠸⡰⡑⡌⣊⠢⡡⠃⠅⠌⢌⢂⠕⢌⢪⢢⢣⡓⡨⠨⡸⡸⡐⢅⠢⡂⠕⡐⢌⠢⡑⢌⢆⢣⠱⡑⡕⡕⡵⡱⡱⡱⡕⣕⡑⢌⠢⡱⡘⠔⡅⢕
⢎⢧⢳⡱⡕⣝⢜⢜⢜⢔⠱⡨⠢⡑⢌⠌⡊⢌⢂⠢⡡⡑⡱⢸⢸⡐⠌⠌⢜⠔⢅⠅⢕⠨⠨⡂⢅⢊⢌⠢⡱⡘⢜⢸⢸⢸⢸⡪⡪⡎⣎⢎⢮⢐⠡⢂⠪⡨⠢⡡
⢫⡪⣣⢣⡫⡪⡎⡇⡇⢎⢪⠨⡊⡌⡢⢑⠨⡐⡐⡡⢂⠪⠨⡊⡆⡇⠌⠌⡆⡣⢡⠡⡑⢌⢊⠔⠡⡂⢆⠣⡪⢸⢘⠬⡒⡕⡵⡱⣣⢣⢇⢗⡕⢔⠡⡡⡑⢌⠪⡰
⣕⢝⡜⣎⢞⢜⢎⢎⢎⠪⡢⢱⠨⡂⡪⢐⠡⢂⢊⠄⢕⠨⢊⠢⡑⢮⢨⢨⢢⢑⠅⡊⢔⠡⢂⠪⡨⢌⠢⡃⢎⢪⠸⡸⡸⡸⡸⣕⢕⢧⡫⡇⡇⢕⠨⣂⢪⢂⢇⢎
⡎⡧⡳⡱⣕⢝⢎⢇⢇⢣⠪⡢⡃⡪⢂⠕⢌⠢⠡⡊⢔⠡⡡⡑⢕⢕⢵⡱⣑⢢⠱⠨⡂⢅⢅⠕⡐⢅⠕⡜⡸⡨⡪⡪⡪⡪⡳⣕⢝⡵⣝⢜⢬⢲⢹⢸⢜⣞⢜⢕
⡮⣚⢎⢧⡣⣫⢺⢸⢸⠰⡱⡨⢢⢑⢅⠪⡂⢕⢑⠌⡢⢑⠰⡘⢔⢱⢱⡣⡪⢢⢃⢇⠪⠢⡑⢌⢊⢆⠣⡊⡆⢇⢎⢆⢇⢗⢽⢜⡵⡝⣜⢜⡜⡜⡜⡜⣝⢜⢜⢌
⣞⢜⡕⣇⢏⢮⢺⢸⢸⢸⠰⡡⢣⢑⢌⢪⠨⡢⠢⡑⡌⡢⠣⡑⢕⢱⠱⡕⡕⢕⠱⡐⢕⢑⢅⠕⢅⠆⡇⡣⡱⡱⡱⡱⡱⣝⢕⢧⡳⡱⢕⢗⢕⢵⡱⡣⡣⣣⢣⢃
⡪⣇⢯⢪⢎⡗⡵⡱⡑⡕⡕⢕⢅⢕⢜⠰⡑⡌⢎⢢⠱⡘⢜⠸⡘⡜⡜⡵⡱⡱⡱⡑⢕⠱⡨⡊⡪⡸⡨⡪⡪⡊⡎⣎⢞⣎⢗⡵⣳⢕⡝⡜⡕⡕⡜⡜⡵⣳⢣⡳
⢽⡸⣪⢳⢕⢽⢜⢜⢌⢎⢎⢎⢆⢣⢊⢎⠜⡌⢆⢕⢱⠸⡘⡜⡜⡜⡜⡵⡣⡣⡪⡪⢪⠪⡢⢣⢱⢸⢘⢌⢎⢎⢎⢮⡳⡵⣝⡾⣵⢝⣮⣺⡸⡜⡜⣎⢞⡵⡫⣫
⡞⡮⡮⡳⣝⢮⢳⠱⡑⢕⢱⢱⢱⢑⢅⢇⢕⠕⡕⡅⡇⡇⡇⡇⡇⡇⡗⣝⡎⡎⡎⡎⡎⡎⢎⢎⢪⢪⢪⢪⡪⣪⢳⢝⡽⣝⣗⢿⣕⡝⣞⣞⢾⢽⣺⢺⢽⡪⡣⡣
⢏⢇⢏⢎⢎⠪⡂⢇⢃⢣⠱⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡜⡎⣞⢎⢮⢪⢪⢪⢪⢪⢪⢪⡪⡪⡣⣣⢣⢏⣗⢽⢜⣮⡳⣕⢝⢎⢮⢪⢳⢸⢪⡳⣝⣞⣮
⠔⡅⢕⢅⢣⠱⡸⢨⢪⠢⡣⢢⢪⢪⢪⠪⡪⠸⡘⢜⢜⢜⡜⡎⡮⡪⡺⡸⡕⡇⡗⡕⣕⢵⢱⢣⡣⡇⡯⡺⡸⣪⡳⢕⢝⢜⢔⢕⢕⢣⢳⢱⢱⢱⢱⠱⣹⡪⡎⡎
⡑⢌⠢⠢⡑⢌⢌⡢⡡⣃⠪⠪⡘⡜⢌⠪⡨⢊⠜⡨⡊⡧⡳⣝⢼⣪⡳⡭⣳⡹⡸⡜⡜⣜⢜⢕⡕⣝⢜⢎⢧⢳⡱⡱⡑⡕⢕⠕⡕⢕⢕⢕⢕⢕⢅⢇⢇⢯⢪⠨
⡪⡢⠣⢣⢡⡑⡔⡑⢍⢆⠇⡏⢎⠌⠆⢕⠨⡐⠌⡢⢱⢹⢝⡾⣽⣺⢮⡫⣞⠎⡎⡪⢪⠢⡣⡳⣹⢜⡵⣹⣪⢳⡑⢅⠕⡜⡰⢑⠜⢌⢊⠢⡑⢅⠣⡑⢅⠣⡑⠕
⢕⠬⡩⠪⡒⡜⡬⡪⡜⡔⡥⡣⡣⣑⢅⢅⢂⢂⠑⢌⠪⡪⡯⣞⣞⢮⡻⣾⢑⠕⢅⠣⡑⢕⢱⢱⢱⣻⣺⡵⣳⣇⢧⢣⠣⣊⢢⠱⡘⡔⢕⠱⡘⣌⢎⢌⠆⡇⡣⠣
⣷⣵⣮⣧⣧⣷⣾⣾⣾⣯⣯⣯⣯⣷⣿⣾⣷⣷⣵⣶⣵⣵⣿⣾⣾⣷⣯⣿⣼⣼⣼⣼⣼⣼⣶⣷⣿⣽⣾⣿⣷⣷⣷⣯⣷⣾⣾⣾⣾⣾⣾⣾⣾⣮⣾⣶⣵⣵⣮⣷`;

console.log(LOGO);

GM_addStyle(`
.inactive-gm { background: #a09f9d; }
.active-gm { background: #eb6395 !important; }
`);

//=================================================================================================

(function disableDisclaimer() {
  if (!$('#disclaimer').length) return;
  $.ajax({ type: 'POST', url: '/user/disclaimer', async: true });
  $('#disclaimer').remove();
  $('body').css('overflow', 'visible');
})();

//=================================================================================================

class EromeRules {
  delay = 150;

  constructor() {
    this.url = new URL(window.location.href);
    this.paginationOffset = parseInt(this.url.searchParams.get('page')) || 1;
    this.paginationLast = parseInt($('.pagination li:last-child()').prev().text()) || 50;
    this.paginationElement = document.querySelector('.pagination');
    this.CONTAINER = document.querySelector('#albums');
  }

  paginationUrlGenerator = (offset) => {
    this.url.searchParams.set('page', offset);
    return this.url.href;
  };

  IS_PRIVATE(thumb) {
    return !!thumb.querySelector('.album-videos');
  }

  THUMB_URL(thumb) {
    return thumb.querySelector('a[href]').href;
  }

  GET_THUMBS(html) {
    return html.querySelectorAll('div[id^=album-]');
  }

  THUMB_IMG_DATA() {
    return {};
  }

  THUMB_DATA(thumb) {
    const title = sanitizeStr(thumb.querySelector('.album-title').innerText);
    const user = sanitizeStr(thumb.querySelector('.album-user')?.innerText);
    return { title: title.concat(` user:${user}`) };
  }
}

const Rules = new EromeRules();

//=================================================================================================

const IS_ALBUM_PAGE = /^\/a\//.test(window.location.pathname);

function togglePhotoElements() {
  $('.media-group > div:last-child:not(.video)').toggle(state.showPhotos);
  $('#togglePhotos').toggleClass('active-gm', state.showPhotos);
  $('#togglePhotos').text(!state.showPhotos ? 'show photos' : 'hide photos');
}

function setupAlbumPage() {
  $('#user_name')
    .parent()
    .append('<button id="togglePhotos" class="btn btn-pink inactive-gm">show/hide photos</button>');

  $('#togglePhotos').on('click', () => {
    state.showPhotos = !state.showPhotos;
  });

  store.subscribe(() => {
    togglePhotoElements();
  });

  togglePhotoElements();
}

//=================================================================================================

function init() {
  if (IS_ALBUM_PAGE) {
    setupAlbumPage();
  } else {
    handleLoadedHTML(Rules.CONTAINER);
    createInfiniteScroller(store, handleLoadedHTML, Rules).onScroll(() => {
      setTimeout(() => new LazyLoad(), 100);
    });
    new JabroniOutfitUI(store, defaultSchemeWithPrivateFilter);
  }
}

//=================================================================================================

Object.assign(defaultStateWithDurationAndPrivacy, {
  showPhotos: { value: true, persistent: true, watch: true },
});

delete defaultSchemeWithPrivateFilter.durationFilter;
defaultSchemeWithPrivateFilter.privateFilter[0].label = 'photos';
defaultSchemeWithPrivateFilter.privateFilter[1].label = 'videos';

//=================================================================================================

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(Rules, state);
store.subscribe(applyFilters);

init();
