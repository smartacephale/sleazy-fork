// ==UserScript==
// @name         missav.com Improved
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.missav.*/*
// @match        https://*.missav123.com/*
// @match        https://*.missav.ws/*
// @match        https://*.missav.to/*
// @match        https://*.missav.live/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=missav.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.meta.js
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

GM_addStyle(`
  #jabroni-outfit-root input[type=checkbox] { padding: 5px; }
`);

class MISSAV_RULES {
  paginationStrategy = getPaginationStrategy({
    paginationSelector: 'nav[x-data]'
  });

  container = document.querySelector('.grid[x-data]');

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbs(html) {
    return Array.from(html.querySelectorAll('div > .thumbnail.group'), (e) => e.parentElement);
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img.w-full');
    const imgSrc = img?.getAttribute('data-src');
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('div > div > a.text-secondary')?.innerText);
    const duration = timeToSeconds(thumb.querySelector('div > a > span.text-xs')?.innerText);
    return { title, duration };
  }
}

const RULES = new MISSAV_RULES();

//====================================================================================================

function route() {
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

route();
