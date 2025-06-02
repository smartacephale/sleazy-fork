// ==UserScript==
// @name         SpankBang.com Improved
// @namespace    http://tampermonkey.net/
// @version      2.2.1
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.spankbang.com/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.6/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spankbang.com
// @downloadURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.meta.js
// ==/UserScript==

const { getAllUniqueParents, timeToSeconds, parseDom, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

const LOGO = `
⡕⡧⡳⡽⣿⣇⠀⢀⠀⠄⠐⡐⠌⡂⡂⠠⠀⠠⠀⠠⠀⠠⡐⡆⡇⣇⢎⢆⠆⠌⢯⡷⡥⡂⡐⠨⣻⣳⢽⢝⣵⡫⣗⢯⣺⢵⢹⡪⡳⣝⢮⡳⣿⣿⣿⣿⣿⣿⣿⣿
⢎⢞⡜⣞⣿⡯⡆⠀⠄⠐⠀⢐⠡⢊⢐⢀⠈⠀⠄⠁⡀⠡⠸⡸⡪⣪⢺⢸⢱⠡⢑⡝⣟⣧⡂⠅⠪⣻⣎⢯⡺⣪⣗⢯⣺⢪⡣⡯⣝⢼⡪⣞⣽⣿⣿⣿⣿⣿⣿⣿
⡱⡣⣣⢳⣻⣯⢿⡐⠀⠂⠁⢀⠪⢐⠐⠄⡀⠁⠄⠁⠀⠄⡑⠆⡎⢎⢎⢇⢕⠬⠀⢇⢣⢻⣞⠌⠌⡪⣷⡱⣝⢮⣺⢕⡗⣕⢧⢳⢕⢗⣝⢞⣾⣿⣿⣿⣿⣿⣿⣻
⡸⡪⣪⡚⣞⣯⡗⣝⡀⠄⠁⡀⠌⡂⠅⡁⠄⠂⠐⠈⠀⢂⢐⢔⢜⢜⢜⢜⢔⢬⢊⠠⠨⠨⣻⣽⢐⠨⡺⣞⢼⢕⣗⡽⣪⢺⢜⢵⡹⣕⢵⡫⣾⣿⣿⣿⣿⣿⢯⣟
⢎⢇⢇⢧⡫⣿⡞⡜⡄⠀⠄⠀⠐⠄⡁⠀⠄⠐⠀⠂⢁⢐⢔⢕⢕⠱⢱⠱⡱⡱⡱⡅⡂⢁⠪⡿⣎⡢⡘⢽⡪⡧⣳⡝⣜⢎⢗⢇⢯⡪⡧⣻⡺⣿⣿⣿⣿⢯⡻⡮
⢕⢝⢜⡜⡮⣻⣗⢕⠅⡀⠂⠈⢈⠐⠀⠁⢀⠐⠀⡁⠄⢊⢢⢣⢣⢣⢣⢣⢣⢫⢪⢪⠀⠄⠨⡚⣿⣳⡜⡘⣗⢽⡺⡪⡺⡸⡵⡹⡕⡧⣫⡺⡺⣿⣿⡿⡯⡯⣫⢯
⢸⢱⢱⢱⢕⢯⣿⢜⠌⢀⠀⠂⠀⠂⠁⠈⠀⠀⠄⠀⠄⢑⠌⡆⢇⢅⠕⡌⡬⡪⡪⡪⠀⠄⢁⠸⡸⣯⡻⣪⢺⡵⡫⡪⣣⢫⡪⡣⡏⣞⢜⢮⣫⣻⡿⣫⢯⢞⣗⢽
⢪⢪⢪⢪⢎⢞⢾⡇⢕⠄⡆⡪⡘⡔⢔⢀⠐⠀⢀⠁⠠⠀⠑⠜⡌⡖⡕⡕⡕⢕⠑⠀⠠⠐⠀⡀⠕⡳⣻⣜⣕⣯⢣⠣⡣⡣⡣⡫⡪⡪⣎⢧⣧⡳⣝⢮⡳⡽⣜⢵
⡸⡸⡸⡸⡸⡱⣫⢯⣲⢱⢱⢘⢜⢜⢕⢕⢅⣂⠀⡀⠐⠀⡁⢐⠨⢐⠡⡊⢌⠂⠄⠂⠀⠂⡠⡠⡢⡫⡳⡱⡝⡮⡪⣇⢧⢳⢕⣝⢮⡫⡮⡳⣕⢵⣓⢗⡝⡮⡺⡜
⠱⡑⡕⡕⡝⡜⣎⢿⣪⢗⡝⡜⡜⡜⡜⢜⢕⢎⢎⢆⢎⢔⢄⠢⡌⢆⢕⠨⡢⢱⢰⢸⢸⣜⢮⢎⢎⢎⢇⢇⢯⢪⢇⡗⣝⢮⢳⢕⡗⣝⢮⡫⡮⣣⡳⡕⣝⢼⢸⢸
⢜⢸⢨⢪⢪⢪⢪⣻⣺⢯⢎⣇⢧⢧⢧⢧⢯⢾⡵⣯⢾⣼⣜⣜⢜⢜⢜⢜⢜⢜⡜⡮⣗⡯⣟⣎⢎⢆⢇⢕⢕⢇⢗⡝⣜⢮⣳⣟⣾⣷⣷⣿⣮⣎⢎⢎⢎⢎⢎⠎
⠣⡑⢌⠎⡜⢜⢜⢜⢜⡕⣧⡳⣫⢏⡯⡯⡯⡯⣯⢯⣟⢷⣻⣟⣿⢷⣷⣳⡽⡮⡾⣝⡎⡏⡎⡇⡕⡜⡔⡕⡕⣝⢜⢮⡳⡽⣺⢽⣻⢿⢿⣟⣿⣺⣝⢮⡢⡧⣧⡠
⠐⠨⢢⢑⢅⢣⢱⢜⢞⢮⡳⣝⢮⣻⣪⢯⢯⡻⣺⢝⡾⣝⢷⢽⣺⢯⢿⢽⣻⣮⡳⣕⢇⢇⢇⢇⠪⡪⡪⡪⡪⣎⢯⢳⣹⡪⡯⣫⢯⣻⢽⣳⣳⣳⢳⣝⢮⡫⡷⣷
⠀⠨⡂⡅⡖⡵⡹⣕⢏⡧⢯⢮⡳⣣⢷⢽⢕⣯⡳⣏⡯⣞⡽⣳⢽⢽⢽⣝⣗⣗⣟⢮⢳⡱⡱⡱⡑⡕⡜⢜⢜⡜⣎⢧⡣⡯⡺⣝⡵⡯⡯⣞⣞⢮⣳⡳⣝⣞⡽⣺
⠀⠰⡸⡸⣸⢪⡫⣎⢗⢽⢕⣗⢽⣕⢯⣳⡫⣞⢮⣳⢽⣪⢯⢞⡽⣺⢵⣳⣳⡳⣳⢝⢵⡹⡪⣎⢎⢆⢇⢇⢇⢗⡕⡧⡳⣝⡝⡮⣞⡽⡽⡵⣳⣫⢞⡮⣗⣗⢽⣳
⠀⠨⢢⢣⢳⡱⣝⢼⢭⢳⢳⢕⣗⢗⡽⣪⢞⡽⣕⢷⢝⡮⣏⡯⣞⣗⢽⡺⡼⣺⢵⡫⡧⣳⢹⢜⡜⡜⡜⢜⢪⢣⡫⣎⢯⡪⣞⣝⢞⢮⢏⡯⣳⣳⣫⢾⢕⣗⢯⣞
⠀⠀⠱⡱⡱⡕⡧⡳⡕⣏⢗⣝⢮⢳⢝⢮⡳⣝⢮⡳⣝⢮⡳⣝⢮⡺⡵⣫⢯⡳⣳⢝⣞⡜⣎⢇⢎⠎⡪⢊⠎⡎⡎⡮⡺⣜⢮⢮⣫⣫⡳⡽⣕⣗⢵⣫⢯⡺⡵⣳
⠀⠀⠈⢎⢎⠮⡺⡸⡕⡧⡳⣕⢝⢮⡫⣣⢯⣪⢳⢝⢮⢳⢝⢮⡳⣝⣝⢮⡳⣝⢮⡳⡵⣝⢼⢸⢐⠅⠂⡐⢅⢇⢣⢣⢳⡱⣝⠮⡮⣪⢞⣝⢮⡺⣕⢗⣗⢽⡹⣪
⠀⠈⠀⠌⡒⡝⡜⣕⢕⢧⢫⡪⡳⡱⣝⢜⢮⡪⣳⢹⡪⣳⢹⢕⢽⡸⣜⢵⢝⢮⢳⢝⢞⢮⡪⡣⡣⡑⢅⢢⠱⡘⡜⡜⣜⢜⠮⡝⡮⡪⡧⡳⡵⣹⡪⡳⡕⡗⣝⢮
⠀⠐⠀⡁⠌⢎⢎⢎⢮⢪⢎⢮⢪⢳⢱⢝⢜⢎⢮⢣⡫⡪⡎⣗⢕⢧⢳⡱⡝⣎⢗⣝⢕⡗⣝⢼⢸⢨⢢⢃⢇⢣⢣⢣⢣⢳⢹⢪⢎⢗⢝⡜⣎⢮⢪⡳⡹⣪⢺⢸
⠀⠠⠐⢀⠐⠈⡎⡪⡪⡪⡪⡪⡣⡫⡪⡪⡣⡫⡪⡣⡣⡫⣪⢪⢺⢸⢪⢪⢺⢸⢪⡪⡺⡸⣪⢪⢪⢪⠸⡨⡊⡎⡎⡎⡇⡏⡎⡞⡜⡕⣕⢕⢕⡕⡇⡧⡫⡪⡪⡪
⢀⠀⠐⠀⠄⠁⠨⡊⡎⡎⡎⡎⡎⡎⡎⡎⡇⡏⡎⡎⡎⡎⡎⡎⡎⡮⡪⡣⡳⡱⡱⡕⡝⣜⢜⢜⢜⢔⢕⢱⠸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡨⡣⡣⡣⡣⡣⡣⡃⡇
⠀⠀⠈⡀⠂⠐⠀⢑⠜⡌⢎⢪⠪⡪⡪⡪⢪⠪⡪⢪⠪⡪⡪⢪⠪⡊⡎⡜⡌⡎⢎⢎⢎⢎⠎⡎⡪⠢⡑⢌⢪⢘⢔⠱⡡⢣⢃⢇⠕⡕⢅⢇⢣⢱⢑⢕⠸⡐⡱⡘`;

class SPANKBANG_RULES {
  delay = 300;

  paginationElement = document.querySelector('.paginate-bar, .pagination');

  paginationLast = parseInt(
    document.querySelector('.paginate-bar .status span')?.innerText.match(/\d+/)?.[0] ||
      Array.from(document.querySelectorAll('.pagination a'))?.at(-2)?.innerText,
  );

  CONTAINER = document.querySelectorAll('.main-container .js-media-list, .main_content_container .video-list')[0];
  HAS_VIDEOS = !!this.GET_THUMBS(document.body).length > 0;

  constructor() {
    Object.assign(this, this.URL_DATA());
  }

  GET_THUMBS(html) {
    return Array.from(html.querySelectorAll('.video-item:not(.clear-fix), .js-video-item') || []);
  }

  THUMB_URL(thumb) {
    return thumb.querySelector('a[title]').href;
  }

  THUMB_IMG_DATA(thumb) {
    const img = thumb.querySelector('img');
    const imgSrc = img.getAttribute('data-src');
    img.removeAttribute('data-src');
    return { img, imgSrc };
  }

  THUMB_DATA(thumb) {
    const title = sanitizeStr(thumb.querySelector('[title]')?.getAttribute('title'));
    const duration = timeToSeconds(thumb.querySelector('span.l')?.innerText);
    return { title, duration };
  }

  URL_DATA() {
    const url = new URL(window.location.href);
    const paginationOffset = parseInt(url.pathname.match(/\/(\d+)\/?$/)?.pop()) || 1;
    if (!/\/\d+\/$/.test(url.pathname)) url.pathname = `${url.pathname}/${paginationOffset}/`;

    const paginationUrlGenerator = (n) => {
      url.pathname = url.pathname.replace(/\/\d+\/$/, `/${n}/`);
      return url.href;
    };

    return { paginationOffset, paginationUrlGenerator };
  }
}

const RULES = new SPANKBANG_RULES();

//====================================================================================================

function route() {
  if (RULES.HAS_VIDEOS) {
    new JabroniOutfitUI(store);
    getAllUniqueParents(RULES.GET_THUMBS(document.body)).forEach((c) => handleLoadedHTML(c, c));
    setTimeout(() => getAllUniqueParents(RULES.GET_THUMBS(document.body)).forEach((c) => handleLoadedHTML(c, c)), 100);
  }

  if (RULES.paginationElement) {
    createInfiniteScroller(store, handleLoadedHTML, RULES);
  }
}

//====================================================================================================
console.log(RULES);
console.log(LOGO);
const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
