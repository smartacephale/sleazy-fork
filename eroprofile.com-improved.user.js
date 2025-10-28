// ==UserScript==
// @name         EroProfile.com Improved
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.eroprofile.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eroprofile.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.6.0/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==

const { timeToSeconds, sanitizeStr, DataManager, createInfiniteScroller, getPaginationStrategy } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, DefaultScheme, JabroniOutfitUI } = window.jabronioutfit;

const LOGO = `
⣷⢿⡿⣿⣟⣿⣿⢿⣿⢿⣿⢿⡽⣺⢕⡗⡵⡹⡜⢮⡫⣞⢵⢹⢸⢕⢇⡳⡱⣝⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣽⣿⡿⣿⣻⡿⣾⡿⣟⣿⣟⣿⣞⣗⢽⡪⣇⢗⢭⡣⡏⣎⠧⡳⡹⡱⡕⣕⢽⣾⣿⡿⣟⣿⣿⡿⣿⣻⣿⣿⡿⣿⣿⢿⣻⣿⣻⣿⣽⣿
⣽⣷⣿⢿⣽⢿⣩⣝⣌⢝⣿⢷⣿⡼⡳⣝⣜⢮⢷⢽⣺⢮⣞⣮⢮⣳⢹⢼⣿⢿⣷⣿⣿⣿⡿⣿⣿⣿⣿⡿⣿⣿⣿⣿⣿⣿⣿⡿⣟⣿
⣯⣿⡾⣑⠐⡐⣽⣻⣾⢾⣻⣿⣳⣿⣻⢮⡺⣪⣯⡳⡽⣝⢞⢮⡻⣜⣾⢿⣿⣿⢿⣟⣿⣿⢿⣿⣿⣯⣷⣿⣿⣿⣷⣿⣿⣿⣾⣿⣿⣿
⣷⡿⣟⣷⣦⣺⣟⣯⣷⣿⣻⣽⣿⣽⣯⡷⡽⣜⢼⢪⡫⡮⣫⣳⢹⣺⣾⣿⣿⣾⣿⣿⣿⣿⣿⣿⣷⣿⣿⣿⣿⢿⣻⣽⣾⣿⣟⣿⣽⣷
⢽⣳⡻⣝⢾⣻⢾⣟⣟⡾⣿⣽⡾⣷⣻⣽⣻⢪⢧⣫⡺⣝⢮⢮⢯⣿⣻⣾⢿⣾⣟⣯⣷⣿⣷⣿⢷⣿⢯⣿⣾⣿⣿⣿⣿⣟⣿⣿⣿⣿
⢕⢧⡫⡳⡝⡮⡏⡯⣳⢻⢵⢳⡫⡳⣝⢞⢮⢯⡳⡄⡯⡺⡝⣞⢽⣞⢽⡺⣟⢾⢽⢯⣟⢾⣳⡻⣫⢯⣻⡳⣯⢷⢿⣷⣿⡿⣿⣻⣷⣿
⡹⡜⡎⡗⡝⡜⡮⡹⡸⡱⡹⡱⣕⢽⢸⡪⡣⡇⡗⡝⡜⡎⡞⡜⡕⡎⡇⡯⡪⡳⣝⢕⢗⡝⡆⣏⢮⢣⢇⢯⢎⢯⣻⣾⣿⣿⣿⣿⣿⣿
⢜⡎⡮⡺⡸⡸⡸⡸⡸⡸⡪⡣⡣⡳⡱⡣⡳⡹⡸⡸⡪⡪⡪⡪⡪⡪⡺⡸⡪⡣⡳⡍⡇⡇⡏⡎⡎⡮⡪⡳⡍⣗⢽⢾⣷⣿⣿⣽⣷⣿
⡱⣹⡪⡞⡜⡜⢜⢌⢎⢢⢱⠸⡸⡸⡸⡱⡹⡸⡸⡪⡪⢪⢊⢎⢪⠪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡎⡞⣜⢎⢮⡳⣻⣿⣷⣿⣿⣻⣿
⡪⡺⡮⡣⡣⡪⡊⢆⢊⢢⢑⠕⢌⢪⠸⡨⡊⡎⡪⢪⠸⡐⠕⠜⡌⢎⢪⢂⠇⡎⡪⠢⡣⡱⡑⡕⡕⣵⡫⡎⡎⡮⣺⣻⣿⣾⣿⣟⣿⣿
⡪⣫⢯⡺⡸⡘⡌⡪⡨⠢⡑⡘⢌⠢⡱⢨⢂⢇⠪⡊⡪⡘⢌⠕⡘⡌⡢⡑⠕⡌⡪⡘⢔⢌⢪⢸⢸⢺⡸⡸⡸⡪⣳⣽⡿⣷⣿⡿⣿⣿
⡪⣳⣫⢞⢜⢜⢌⡲⣘⢌⠬⡨⠢⡑⢌⠢⡑⡐⡑⢌⠢⡊⢄⠑⢌⢂⢊⠌⡊⠔⠔⢌⠢⡊⡢⡑⢕⢕⢕⢕⢕⣝⢮⣿⣿⣿⣷⣿⣿⣿
⣪⣳⡳⣝⢼⢸⢘⢮⢗⡯⣳⢵⢕⢌⡂⡢⢂⠕⠨⡂⢕⠨⠠⡑⡐⠰⡐⡐⠄⠅⡑⡁⡊⠔⡐⢜⢸⢸⡑⡕⡕⣕⣿⣿⣿⣿⢿⣿⣻⣿
⣜⣾⢽⣎⢗⡕⣵⢳⣕⢝⢎⢗⢝⢕⢗⡌⡂⡊⢌⠢⡁⡊⢌⢐⠨⠨⡐⡐⠄⠅⡂⡂⡂⡑⠨⡢⣣⢳⢸⢸⢸⡺⣾⣿⣿⣾⣿⣿⣿⣿
⢼⣿⣿⢮⣳⢹⢜⡕⡵⡹⡳⡱⠡⡊⡢⢹⢸⡠⡡⢂⢊⠄⠅⡂⢅⢑⠐⠄⠅⡂⢂⠐⠄⢌⠸⣸⢳⢹⢰⠱⡕⣝⣿⣿⢿⣿⣿⣿⣿⣿
⡿⣿⣽⣿⣞⡵⡯⡪⡗⣝⢌⠊⢕⠨⡂⡣⢣⢳⢱⠡⡂⢅⠕⠨⡐⠄⠅⠅⡂⡂⠡⠨⠨⢐⠨⡘⡜⢜⢔⢝⣜⣞⣿⣿⣿⣿⣿⡿⣟⣿
⣿⣿⣿⣿⡷⣯⡻⣪⢝⠢⢡⢑⠔⠡⡂⡊⡢⡃⡇⣏⢎⢔⠨⡨⢐⠡⡡⢑⠐⠄⢅⢑⢌⢢⢱⢸⢸⠸⡸⡸⣲⣳⣿⣿⣿⡿⣿⣿⣿⣿
⣿⣿⣿⢿⣿⣳⣝⢎⢇⠕⡐⡐⡡⢑⠌⡂⡢⢊⢌⢒⢝⢼⡸⣐⢅⠕⢌⠢⡡⡑⢅⢆⢇⣗⢽⢸⢸⢸⢸⣪⣳⣽⣿⣿⡿⣿⢟⡯⣗⣗
⣿⣿⡿⣿⣿⣗⣗⣇⢆⠕⡨⢂⢊⠐⢌⢐⠌⡂⡊⠔⡨⡂⢏⠺⡼⡜⡦⣣⡪⣪⡪⡮⡾⡮⡧⣣⣇⢗⣕⢵⡳⡿⡯⣷⡻⣝⢵⡫⡞⣜
⣿⣿⣿⣿⣿⣗⡷⣳⢝⢮⡢⡱⡠⢡⢁⠢⡈⡂⡢⢑⠐⢌⢂⢣⠱⡱⡹⡪⡺⡵⣝⣝⢮⢯⡺⡳⣕⢯⣪⣳⢽⢯⡻⣜⢮⢣⡳⡕⡝⡆
⣿⣿⣿⣿⣿⣯⡿⡽⣝⢵⡱⡕⢕⡑⠔⠡⡂⡊⡐⠄⢅⠕⡐⢅⢊⠆⢕⢱⢹⢸⢪⢎⢗⣕⢏⢯⢮⢳⣕⡯⣫⡣⡧⡳⡱⡣⡣⡣⡣⡣
⣿⣿⣿⣿⣯⣷⣿⡯⡷⣝⡎⡎⡖⡘⢌⠌⠔⠨⢐⠡⠢⡑⢌⠢⢢⠑⡅⠕⢅⠇⡇⡣⡓⡜⡎⡇⡗⣗⡗⡽⣸⢸⢸⢜⢜⢜⢜⢜⠜⡌
⡯⣗⢗⣗⢽⢽⢽⡻⣯⢷⣝⢜⢜⢌⢂⢊⠌⠌⠔⡈⡢⢈⠢⢑⠡⠱⢸⢘⠜⡌⢎⢌⢎⢆⢇⢇⢯⢞⢎⢎⢎⢎⢎⢎⢎⢪⢊⢆⢣⢑
⡺⡸⡱⡕⡽⣱⢣⢯⡪⣗⡝⡷⣱⢱⢨⠢⡡⢡⢑⢐⢐⢡⠨⢂⠅⢕⠡⡊⡜⣜⢼⢬⢲⢵⣺⢺⢝⢜⢜⠜⡌⢎⢢⠣⡪⡂⢇⠆⡣⡑
⢱⠱⡱⢱⢱⢱⢹⢸⢸⢢⡫⡺⡪⣳⢱⡑⡌⡂⡢⠡⢃⠣⢋⠅⠕⢅⠣⡱⡱⡝⡜⡜⡎⡇⡧⡓⡕⢕⠸⡨⢪⢘⢔⢑⢢⢑⠕⡨⢂⠪
⠅⡕⢜⠸⡨⢪⠪⡪⡪⡪⡪⡣⡫⡪⡪⡎⡦⡑⡐⡡⠡⠨⢂⠊⢌⠢⡱⡼⡱⡱⡱⡱⢱⠱⡑⡕⡱⢡⠣⡑⡅⢕⢘⢌⢢⢑⢌⠢⡡⡣
⠡⡂⢅⠕⡘⢌⠪⡊⡎⡪⡪⡪⡪⡪⡺⡸⡸⡪⡢⡊⢌⢌⠢⡑⢅⢮⢾⢱⢱⠱⡱⢸⢘⠜⡌⡪⡨⢢⠱⡨⡘⢌⠢⠢⡑⢔⠔⣕⢵⢫
⠢⢊⠐⢌⢐⠅⢕⢑⢜⢰⢑⢕⢕⢕⢕⢕⢕⢍⢇⢧⢱⢐⢕⢌⢇⢕⣕⢇⢇⢣⢱⢑⢅⢣⠱⡘⢌⠢⡑⠔⢌⠢⡑⡑⢌⢢⢽⢪⡣⣣
⠌⠄⢅⠅⡢⢑⢐⠅⡢⢱⠨⡢⡃⡇⡣⡣⡣⡣⡣⡣⡪⡪⡪⣪⢎⢮⡺⡸⡨⡪⢢⠱⢨⠢⡑⢌⠢⡑⢌⢊⠢⡑⢌⢜⡜⣜⢵⢣⢣⠣
⡡⠡⠡⡂⠢⡁⡢⠑⢌⠢⡱⢨⠪⡸⡨⢪⢸⠰⡑⡕⣝⢜⢮⢗⡧⡣⡗⡕⡕⡸⡐⢅⠣⡊⢌⠢⡑⢌⠆⢕⠱⣸⣸⡾⣸⢸⡝⡎⡎⡎
⢂⠅⢕⠨⡈⡂⠢⡡⢑⠌⡢⢃⠇⢕⡘⡌⡆⢇⠕⡕⣕⢕⠯⡯⣺⣑⢏⢎⢎⠢⡊⡢⡑⢌⢢⢑⠌⡆⣣⣣⣷⡿⣯⢣⡣⣻⢪⡣⡣⡣
⠢⡑⡐⠔⡐⠌⡌⢄⠕⡨⡨⠪⡘⢔⠌⡆⢕⠅⡕⢜⡸⣜⢽⢽⢮⡪⡕⡕⡅⡇⢕⠔⡅⣕⣢⢵⣵⣷⣿⣻⣽⣿⡫⡪⣪⡳⣣⡣⡣⡣
⢅⠢⠨⡈⡢⡱⡨⣂⢪⠰⡘⢌⢊⠆⡕⢜⢐⢅⠪⡢⣣⢷⢽⣹⣷⣳⣗⡷⣷⣷⢷⣽⣻⣗⣯⣿⢿⣾⣯⣏⣿⣱⢱⢱⢱⢭⢒⡱⡑⡅`

class EroProfileRules {
  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.boxNav2',
    searchParamSelector: 'pnum'
  });

  container = document.querySelector('.videoGrid');

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbs(html) {
    return Array.from(html.querySelectorAll('.video'));
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    const imgSrc = img?.getAttribute('src');
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('[title]')?.getAttribute('title'));
    const duration = timeToSeconds(thumb.querySelector('.videoDur')?.innerText);
    return { title, duration };
  }
}

const RULES = new EroProfileRules();

//====================================================================================================

function route() {
  if (RULES.container) {
    parseData(RULES.container);
  }

  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  new JabroniOutfitUI(store, DefaultScheme);
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
