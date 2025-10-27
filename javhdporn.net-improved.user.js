// ==UserScript==
// @name         javhdporn.net Improved
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.javhdporn.net/*
// @match        https://*.javhdporn.*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javhdporn.net
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==

const { timeToSeconds, sanitizeStr, DataManager, createInfiniteScroller, getPaginationStrategy } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

const LOGO = `
⢆⠕⡡⡑⢌⠢⡑⢌⠢⡑⠔⢌⠪⡐⢌⢊⠢⡑⢌⠢⡑⡡⡑⢌⡊⡆⣕⡱⣌⣦⣎⣦⣧⣎⡆⢕⠐⢔⠨⡨⢂⠅⢕⠨⡂⡅⡢⢡⠢⡑⢌⠢⡢⢱⠰⡨⢢⢑⠌⡆
⠕⡨⢂⠪⡐⡑⢌⠢⡑⢌⢌⠢⡡⢊⠔⡐⢅⠪⡐⢌⢢⡲⣜⡵⣽⣽⣾⣿⣿⣿⣿⣿⣿⣿⣿⡎⡜⢔⢱⠨⡢⠱⡡⠱⠨⠢⠱⡑⠜⠌⢆⠣⡊⡢⢃⠣⡃⡣⢃⠣
⢇⢪⠸⡨⢌⠜⢌⠜⠌⢆⢕⠱⡘⢔⢑⠜⡐⢕⠸⡸⡷⣿⣻⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⡿⣄⢕⣐⢅⢆⡕⣌⢎⢬⢕⢕⢜⢜⢜⢆⢗⢜⡔⣇⢧⢳⢸⢪⡣
⢱⢐⢕⢔⣑⢌⢆⡕⡕⡥⡢⡕⡬⡲⡰⡱⡪⡲⣱⣻⣯⣷⣿⣻⣽⣿⣿⢿⣿⣟⣯⣷⣿⣿⣻⣿⡝⣜⢜⢜⡜⣜⢜⢜⢕⢕⢕⢜⢜⢜⢎⢎⢇⢇⡇⡧⡳⡹⡜⡮
⢸⢱⢕⢇⢇⢗⢕⢵⢱⢣⢳⢱⢕⢵⢹⢜⢎⢞⢼⣽⡾⣷⣻⣟⣞⣷⣿⣿⣿⣿⢿⣟⣿⣟⣿⣿⢸⢱⡣⡣⡣⡣⡣⡳⡱⡹⡌⢜⢜⢕⢕⢵⢹⢸⡸⡜⡜⡎⡮⡺
⡕⡕⣕⢕⢇⢏⢎⢇⢗⢕⢇⢧⢳⢱⢱⡱⡱⡕⡵⣿⣽⢿⣽⡯⣿⣻⣿⣟⣷⣻⡿⣯⣿⢯⢷⣻⢇⢇⢧⢣⢣⢣⡣⡣⡣⡣⡣⢱⢱⢱⢱⢕⢕⢕⢕⢕⢝⢜⢎⢎
⢜⢜⢜⢜⢎⢎⢇⢗⢕⢕⢇⢇⢧⢳⢱⢱⢱⢕⢽⢷⣟⣿⢾⣟⣿⢽⣿⣿⣽⣿⡿⡯⡯⣟⡵⣗⢕⢕⢝⡜⡜⡜⡜⡜⡜⡜⡬⢸⢸⢸⢸⢸⢸⢱⢱⢹⢸⢱⡱⡹
⡇⡏⡎⡎⡎⡮⡪⣪⢪⢣⡣⡳⡱⡱⡱⡱⡕⣕⣽⢿⣯⡿⣿⡿⣾⣻⡿⣿⣳⣿⢯⣿⣽⣗⣿⣳⣵⢵⢹⢸⢸⢸⢸⢸⢸⢸⢂⠕⡕⡕⡕⡕⡕⡕⣕⢕⢇⢇⢇⢏
⢪⢪⡪⡪⣪⢪⡪⡪⡪⡣⡺⡸⡸⡸⡪⡪⡪⡲⣽⣻⡷⣿⣿⣿⣿⣾⢿⣿⣵⣿⣽⣿⣿⣻⣿⣿⡮⡣⡣⣣⡣⡣⡣⡣⡣⡣⡃⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡣⡳
⢸⢸⢸⢸⢸⢸⢸⢸⢱⡱⡕⡕⡝⡜⡜⡎⡮⡪⡺⣽⣟⣯⣿⡿⣟⡿⣿⣿⣻⡽⣟⢟⢞⡕⡗⣕⣝⣾⣽⣿⣿⡿⣷⣕⢕⢕⠕⡸⡸⡘⡬⡪⡪⡪⡪⡪⡪⡣⣓⢝
⢸⢸⢸⢸⢸⢸⢜⡪⡪⡪⡪⡪⡪⣪⢪⡪⣪⣮⢿⣺⣯⣿⣷⣟⡞⡞⡮⡹⡕⡏⡮⡳⡱⣕⢽⣺⣾⣿⢿⣻⡿⣿⣿⣿⢜⢔⠕⡅⡇⢇⢇⢎⢎⢎⢎⢎⢎⢎⢎⢮
⡘⡜⡜⡜⡜⡜⡆⡇⡇⡇⡇⡇⡇⡇⡧⣳⣿⣽⣿⣻⣿⣿⣿⣿⣿⣎⣗⢝⡜⣜⢵⢝⣜⣾⣿⣿⣿⣻⣽⣿⣿⣿⣿⣿⢱⢱⠡⡃⡎⡎⢎⢪⢸⢸⢘⢜⢜⢜⢜⢜
⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⣺⡿⣷⢿⣿⣽⣿⣾⣻⣿⣿⣿⣿⣷⣧⣧⣳⣷⢟⣟⣽⣿⣳⣟⣾⣿⣿⣿⣿⣿⢸⢰⠱⡡⢣⢣⢣⢣⢣⠣⡣⡣⡣⡣⡣⡣
⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡱⡺⣟⣿⣻⣿⣿⣿⣿⣾⣻⣿⣿⣽⣿⣽⣿⣿⣽⣝⣞⢟⣗⢽⣻⣿⣿⣿⣿⣾⡇⡇⡕⢕⠅⡣⡣⡣⡕⡜⡜⡜⡜⢜⢜⢜⢜
⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⢪⣿⣯⣿⣻⣿⣷⣿⣿⣻⣿⡿⣿⣿⣿⣿⣾⣿⣿⣞⣗⢗⣯⣻⣿⣿⣿⣽⣿⡇⡕⡜⡌⡂⡇⡏⣣⢣⢪⠪⡢⡣⡣⡣⡣⡣
⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢇⢗⡿⣾⣯⣿⣿⣿⣿⣿⣷⡽⡿⡿⣿⣻⣻⣿⢿⣿⣟⡿⣿⢽⣾⣿⣿⣽⣿⣿⢕⠕⡜⢌⠢⡱⣱⡪⡊⡆⡇⢇⢣⢣⠣⡣⡣
⠱⡱⡱⡱⡑⡕⡕⢕⢱⢑⢕⢕⢕⢕⢕⣿⣻⣾⣻⣿⣟⣟⣿⣿⣽⣿⡿⣿⣻⣿⣾⣿⡿⡿⣿⣿⣿⣿⣫⣿⣻⣽⣾⡇⡇⢎⢎⠢⡱⡸⡸⡨⢪⢸⠸⡸⡸⡸⡸⡸
⢱⢱⢱⢸⢸⢸⢸⢸⢸⢸⢸⢰⢱⢑⢕⣯⣿⢾⣻⣿⣽⣿⣻⣿⣯⣷⣿⣿⣿⡷⡿⡿⣿⣿⣷⣻⣽⣷⣿⣿⣿⣿⣿⣇⢇⢣⠪⡐⡱⡸⣆⢇⠕⡅⢇⢇⢎⢪⢸⢸
⡨⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⡪⣺⣿⣽⢿⣿⣿⣿⣿⣿⣿⡿⣟⡿⣽⣺⣝⡯⡿⣽⣺⢯⢿⣻⣿⣿⣿⣿⣿⢿⣿⠰⡑⡕⡨⢌⢗⢕⢱⢑⠕⡕⡜⢜⢜⢜⢜
⡸⡸⣘⠬⡪⡪⡪⢪⠪⡪⡪⢪⢪⢪⣿⢷⣟⣿⣿⣿⣿⣻⣿⣟⣞⣗⣯⢷⣳⣗⡿⣽⣳⣽⡽⣿⢽⣿⣿⣿⣽⣾⣿⡗⢕⢱⢑⢌⢢⠣⡪⢢⢃⢇⢕⢜⢜⢔⢕⢜
⣊⢎⢆⢇⢇⢇⢎⢎⢎⢎⢎⢎⢎⣾⣟⣿⣽⢿⣿⣷⣿⣿⣿⢽⡾⣵⣭⣽⣼⣼⣼⣼⣴⣵⡾⡾⡫⢽⣷⣿⣿⣿⣿⡏⡪⡢⢣⢊⢢⠣⡣⢣⢱⢡⢣⢱⢡⢣⢱⢑
⢆⢇⢇⢣⢣⢣⢣⢣⢣⢣⠣⡣⡱⣷⣟⣿⢾⣿⣿⣿⣿⣿⡳⡱⡑⠝⢯⡿⣿⣽⣟⣿⠯⡣⡃⢎⠜⢜⣿⣿⣿⣿⣿⢚⣎⢞⣧⡪⠢⡣⡃⡇⡕⡜⢔⠕⡅⡇⡣⡣
⡇⡇⡣⡣⡣⡱⡸⡸⡨⡒⡕⡕⡕⣿⣽⣟⣿⣻⡿⡻⣯⣗⢇⢇⢊⢊⠢⡙⣿⣯⡿⢡⢑⠔⢌⠢⡑⢕⢻⢏⢛⠾⣿⠪⡒⡵⡨⡷⡕⡅⡇⢎⠆⡇⡣⡣⢣⢱⢑⢅
⡜⢜⢜⢌⢎⠎⡎⡪⡪⢪⠪⡪⣺⡿⣷⣟⣯⢗⢕⠡⡹⡱⡑⢔⠡⢂⢑⢐⢹⡗⢕⢅⠢⢊⢐⠐⢌⠢⡹⡨⠂⢕⢜⢕⠱⡱⡹⣾⢮⣮⣪⡸⡘⡌⡎⡜⢜⢌⢎⢎
⢪⢪⢢⢣⠣⡣⡣⡣⢣⢣⠣⣝⣿⣻⣽⡾⣿⢱⢂⠕⡨⠊⡌⡢⠨⢂⠂⡂⣹⢑⠕⢄⠕⡐⠄⡑⡰⢑⠡⢂⠅⡑⡜⡐⢕⢱⢹⡺⣟⣾⣽⣻⢷⣧⠪⡊⡎⡪⡢⡣
⡣⡱⡑⡕⢕⢕⢜⢜⠜⡌⡎⡎⣾⣿⣽⣟⣯⣳⢜⠔⡌⢌⢂⡊⡪⡐⡐⡐⣾⢐⢕⠡⡂⡢⢡⢘⢐⢐⠨⡐⡨⡂⢧⢑⢕⢱⢱⢝⣿⣳⣟⣾⣻⢾⣿⡨⡪⡊⡆⡇
⡕⡕⢕⠕⡕⡅⡇⡎⢎⢪⢊⢎⢿⣞⣷⣿⣗⡵⣣⢳⢘⢔⠡⡊⡢⡱⡰⣸⡗⡜⡼⡸⡐⣔⠪⡐⢅⠢⡑⠔⡌⡌⢆⢕⢜⢜⢜⢮⣷⣻⣞⢾⣺⣟⡾⣷⢱⠸⡘⡌
⡱⡸⡸⡸⡘⡌⡎⡪⡪⡪⢪⢮⣿⢯⣿⢾⣿⡮⣇⠇⢧⡣⡓⣌⡒⡌⡮⡺⡪⡪⣇⢯⢪⢎⢎⢊⠎⡎⡢⡱⡱⡑⡌⡎⡎⡮⣺⣽⣞⡷⣽⢻⡺⡮⣟⣟⠜⡜⢜⢜
⢸⢨⢪⢢⠣⡣⡣⢣⠣⡪⣺⢿⣽⣿⡽⡯⣞⡿⣾⣕⡕⣪⡪⣢⡱⡱⡱⣼⣮⣯⡪⣾⢵⣝⢎⡎⡎⡎⡪⡪⡪⡪⡪⣪⣣⣯⡷⣟⡾⣝⢮⣳⢽⢽⡽⡇⡣⡣⢣⢱
⢜⢜⢔⢕⢕⢕⢜⢜⢜⠜⣜⣿⣽⡾⣟⣯⢷⢯⣟⣗⣿⢶⣝⣼⡸⠼⡸⡸⡱⡫⡹⡙⡝⡝⡟⡞⡽⡜⡮⡺⡪⡮⣯⡾⣾⢷⣿⢿⢽⢽⢵⣫⣯⢿⢋⢎⢜⢌⢎⢎
⢸⢰⠱⡱⡸⡰⡱⡱⡸⡘⡬⣷⣟⣿⣻⣽⣻⡽⣷⣻⡾⣓⢢⠲⡨⡣⡱⡸⡨⡊⡆⢇⢣⢱⢑⢕⠱⡑⡕⢅⢇⢮⣷⢿⣻⣟⣯⢯⢯⢾⢽⡾⡙⡅⢇⢪⠢⡣⡱⡸
⢕⠕⡕⢕⢜⢌⢆⢇⢎⢎⢪⢺⣯⣯⡿⣯⡷⣿⢽⡿⡨⡢⢣⠣⡣⡱⢱⢘⢌⢎⢜⢜⢸⠰⡑⡅⢇⠇⡎⡪⣪⣿⡽⣟⣿⣽⣳⢯⢿⣽⡛⡅⢇⢕⢱⢡⢣⢱⢸⢨
⠀⢣⠣⡣⡱⡑⡅⡇⢎⢪⠸⡼⣟⣾⣻⣯⢿⢽⢯⡗⢜⢌⢆⢇⢣⠪⡊⡎⡢⢣⠪⡂⡇⡕⢕⠱⡑⢕⢅⢷⣻⣾⣻⢿⣽⡺⡺⣽⢿⠪⡂⢇⠕⡜⡰⡑⡜⢔⢕⠱
⢂⠀⠣⢑⠡⢃⢑⢘⢘⠘⠌⣟⣯⣟⣾⢽⣯⢿⣽⣻⠨⢂⢃⢊⢂⢃⠣⢑⠡⢃⢑⠑⢌⢘⢈⠪⢘⠨⣪⣿⣽⣳⣿⣻⢾⣝⣝⣾⢃⠡⠁⢅⠡⢁⢊⠨⠨⠨⠈⡊
⠐⡡⠀⠡⢐⠐⡐⡀⡂⠌⣸⡺⣳⣻⣞⣿⢽⣽⢾⣯⠈⡐⠠⠁⡂⠡⠨⠠⠁⠅⠌⠨⠠⢁⠂⠡⠁⠌⡉⡞⡾⡽⣞⣯⡿⣯⣷⣟⣆⠈⡈⠠⠐⠀⠄⠂⠀⠁⡂⠔
⠂⠌⠠⠁⢐⠐⢀⠂⠠⠁⡳⣳⢯⢷⣻⡾⣟⣾⣻⣞⠀⠄⢈⠠⠀⢁⠀⡁⢈⠀⡁⢈⠠⠀⢈⠀⠡⠀⠠⢈⢂⢻⣯⢷⣻⣽⢾⣽⢾⡀⠠⠐⠀⠐⠀⠄⠁⠡⠀⢂
⠄⠈⠌⢂⠀⢂⢂⠄⠅⡂⡾⡽⣝⣯⡿⡯⣿⣺⢷⣻⡄⠂⢀⠠⠈⠀⠠⠀⠂⠀⠄⠀⠄⠈⠀⠐⠀⠈⠀⠀⠂⢱⠍⢿⢽⢾⢻⢽⣯⢷⣄⡀⠄⠂⠁⠀⡁⠨⠀⠄
⢁⠐⠊⠠⠀⠂⠢⠨⢂⢂⢯⡯⣗⣯⣟⢸⡯⡢⣟⣷⡃⠠⠀⠄⡀⠂⠄⢂⠐⡀⡂⢐⠀⡂⠌⡀⢂⠡⠈⠠⠐⡸⡧⣿⢽⢧⠱⡐⢝⣯⢿⡦⢀⠠⠀⡁⠀⢐⠀⠂
⣖⠀⡊⠨⡂⠨⣨⡪⠦⠖⡫⣏⢯⢞⡦⡽⡪⡌⣗⣯⠡⠈⡀⢁⠠⠈⡀⠄⠠⠀⠠⠀⠄⠠⠀⠄⠠⠀⡈⠀⠄⢸⠅⣪⡯⣻⠬⡬⡢⡹⡽⡉⠀⠀⡀⠂⡁⢐⠀⡁
⠳⠑⡂⡑⠉⡐⠄⡂⡂⡡⣺⡪⣯⣫⡇⢾⡜⠬⣞⡮⡇⠠⠐⡀⠄⢂⢀⠂⡂⢁⠂⠡⠐⢐⠐⢈⠠⠐⡀⡐⢌⢜⡵⣜⢧⡻⡜⢔⢜⢼⣝⢗⠈⡀⠄⡁⡐⢐⠄⢂
⡠⠡⡐⠄⡁⠆⠕⢌⠔⠔⠜⡞⠷⢽⠽⡜⡯⡇⡿⢝⠇⡨⢐⠠⠨⠠⢐⠠⠂⡂⠌⠄⠅⡂⠌⡐⠄⠅⠄⠪⠆⠯⠺⠝⠝⠣⠃⡓⠚⢙⠊⢃⠁⡂⠅⡂⢢⢑⢕⠁`;

class JAVHDPORN_RULES {
  paginationStrategy = getPaginationStrategy({
    pathnameSelector: /\/page\/(\d+)\/?$/
  });

  container = this.getThumbs(document.body)?.[0].parentElement;

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbs(html) {
    return Array.from(html.querySelectorAll('article.thumb-block'));
  }

  getThumbImgData(thumb) {
    return {};
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('header.entry-header')?.innerText);
    const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText);
    return { title, duration };
  }
}

const RULES = new JAVHDPORN_RULES();

//====================================================================================================

function router() {
  if (RULES.container) {
    parseData(RULES.container);
  }

  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  new JabroniOutfitUI(store);
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

router();
