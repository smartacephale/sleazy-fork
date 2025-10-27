// ==UserScript==
// @name         Erome Improved
// @namespace    http://tampermonkey.net/
// @version      4.0.1
// @license      MIT
// @description  Infinite scroll. Filter photo/video albums. Toggle photos in albums. Skips 18+ dialog
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        *://*.erome.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erome.com
// @run-at       document-idle
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @downloadURL https://update.sleazyfork.org/scripts/492883/Erome%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/492883/Erome%20Improved.meta.js
// ==/UserScript==
/* globals $ LazyLoad */

const { getPaginationStrategy, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDurationAndPrivacy, JabroniOutfitUI, defaultSchemeWithPrivacyFilter } = window.jabronioutfit;

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
  container = document.querySelector('#albums');

  paginationStrategy = getPaginationStrategy({});

  isPrivate(thumb) {
    return !!thumb.querySelector('.album-videos');
  }

  getThumbUrl(thumb) {
    return thumb.querySelector('a[href]').href;
  }

  getThumbs(html) {
    return html.querySelectorAll('div[id^=album-]');
  }

  getThumbImgData() {
    return {};
  }

  getThumbData(thumb) {
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

function route() {
  if (IS_ALBUM_PAGE) {
    setupAlbumPage();
  } else {
    parseData(Rules.container);
    createInfiniteScroller(store, parseData, Rules).onScroll(() => {
      setTimeout(() => new LazyLoad(), 100);
    });
    new JabroniOutfitUI(store, defaultSchemeWithPrivacyFilter);
  }
}

//=================================================================================================

Object.assign(defaultStateWithDurationAndPrivacy, {
  showPhotos: { value: true, persistent: true, watch: true },
});

delete defaultSchemeWithPrivacyFilter.durationFilter;
defaultSchemeWithPrivacyFilter.privacyFilter[0].label = 'photos';
defaultSchemeWithPrivacyFilter.privacyFilter[1].label = 'videos';

//=================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { state } = store;
const { applyFilters, parseData } = new DataManager(Rules, state);
store.subscribe(applyFilters);

route();
