// ==UserScript==
// @name         SpankBang.com Improved
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.spankbang.*/*
// @match        https://*.spankbang.com/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.4.9/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spankbang.com
// @downloadURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.meta.js
// ==/UserScript==

const { getAllUniqueParents, timeToSeconds, getPaginationStrategy, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

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
  container = document.querySelectorAll('.main-container .js-media-list, .main_content_container .video-list')[0];
  HAS_VIDEOS = !!this.getThumbs(document.body).length > 0;

  constructor() {
    this.paginationStrategy = getPaginationStrategy({
      paginationSelector: '.paginate-bar, .pagination',
    });

    const pagination = this.paginationStrategy.getPaginationElement();
    this.HAS_PAGINATION = pagination && pagination !== document;
  }

  getThumbs(html) {
    return Array.from(html.querySelectorAll('.video-item:not(.clear-fix), .js-video-item') || []);
  }

  getThumbUrl(thumb) {
    return thumb.querySelector('a[title]').href;
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    const imgSrc = img.getAttribute('data-src');
    img.removeAttribute('data-src');
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('[title]')?.getAttribute('title'));
    const duration = timeToSeconds(thumb.innerText.match(/\d+m/)?.[0]);
    return { title, duration };
  }
}

const RULES = new SPANKBANG_RULES();

//====================================================================================================

function route() {
  if (RULES.HAS_VIDEOS) {
    new JabroniOutfitUI(store);
    getAllUniqueParents(RULES.getThumbs(document.body)).forEach((c) => { parseData(c, c) });
    setTimeout(() => getAllUniqueParents(RULES.getThumbs(document.body)).forEach((c) => { parseData(c, c) }), 100);
  }

  if (RULES.HAS_PAGINATION) {
    createInfiniteScroller(store, parseData, RULES);
  }
}

//====================================================================================================

console.log(LOGO);
const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
