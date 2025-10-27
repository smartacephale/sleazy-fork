// ==UserScript==
// @name         Eporner.com Improved
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.eporner.com/*
// @match        https://*.eporner.*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.5/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==
/* globals show_video_prev */

const { timeToSeconds, sanitizeStr, DataManager, createInfiniteScroller, getPaginationStrategy } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

const LOGO = `
⡿⣕⢕⢵⡱⣝⢪⡪⣎⢧⢳⡱⡝⡮⡳⡽⣕⢯⢯⢯⢯⢯⣗⡕⡕⡕⡕⡕⡕⡕⡕⡕⡇⡗⣝⢎⡗⡯⣟⣿⣽⣟⢿⢽⣫⢮⢳⡱⣣⢳
⢿⡵⣝⢼⡸⣜⢞⣮⢾⢮⡧⡳⣝⢎⢯⡺⡪⣏⢯⢯⢯⢗⣗⢧⢣⢣⢱⢑⢕⢱⢑⠭⡪⡎⡮⡺⣸⢹⣻⡾⣽⣞⣯⢯⡪⡎⡧⡣⣣⢳
⣿⣺⣵⣳⣝⣞⣟⣾⣻⣷⠯⣯⡺⡭⣳⡹⡹⡼⣝⢽⢝⡽⣺⢝⡜⡌⡆⢇⠕⡅⡕⢕⢱⢱⢱⢕⡳⣹⡪⣿⢯⣷⡻⣪⡚⣎⢮⢪⡪⡣
⣯⡷⣗⣗⣗⣗⣟⣟⡾⡯⡯⡧⡳⡹⡲⡹⡭⣳⢝⡽⣝⢽⣪⢗⢵⢱⠱⡑⡕⡱⡘⡜⢌⢎⢎⢎⡞⣜⡮⣯⢿⢵⢹⢢⢣⢣⢣⢣⢣⡫
⣯⢿⣯⣗⢷⣕⣗⢯⣞⢽⢕⢇⢏⡎⡧⡫⡮⡳⣝⢞⢮⡫⣞⢭⡳⡕⣝⢜⢜⢜⢜⢜⢜⢜⢜⡕⣕⢗⣽⢺⢕⢧⢳⢱⢱⢱⢱⢱⢕⢝
⣟⣿⢷⡯⣗⡷⣕⣗⢵⢳⡱⡝⡎⡞⣎⢗⢽⡪⣗⢽⢵⢝⣎⢧⡣⣏⢮⡪⡇⡯⡺⡪⡧⣫⢧⢯⣺⣳⢳⢱⡹⡸⡸⡘⡜⡸⡘⡜⣜⢕
⣟⣾⢿⣟⣷⣫⣗⣗⢽⣪⢮⡳⣝⣞⢮⢏⣗⢽⡪⣗⣝⢮⡺⣜⢮⡪⣣⢳⡹⡸⡵⡹⣝⢮⣫⣗⡿⣞⢜⢼⢸⢸⢸⢘⢜⢌⢎⢎⢮⡳
⣟⣾⣻⣿⢷⣻⢾⣺⣽⣺⣳⢽⣺⡪⣗⢝⢮⢳⢹⢜⣜⠵⡕⡧⡳⣹⢸⡱⣱⢹⢜⢝⡼⣕⢗⣗⢿⣗⢕⡕⣕⢕⢕⢱⢑⢜⢜⢜⢵⢕
⣟⣮⢷⢿⣿⣻⡯⣷⢗⣗⣗⢽⡪⡺⡸⡕⡇⣏⢎⢗⢜⢝⢎⢗⢽⢸⢪⢎⢮⢺⢸⢕⡳⣕⢯⣺⢽⣾⣕⡕⡕⡕⡕⡕⢕⢕⢕⢵⡹⣕
⣳⢽⣫⣟⣯⣷⢿⡽⣽⣪⢮⡣⣏⢞⢜⢎⢎⢎⢮⢪⢣⢳⢹⢹⢜⡕⡧⡳⡱⡕⡇⡗⣝⢎⢷⢽⢽⣾⢷⣯⣺⢸⡸⡸⣘⢆⢗⣕⢯⣺
⣮⡻⣺⣺⢽⣟⣯⣟⣞⡮⣗⣝⢎⢧⢳⢹⢸⢱⠱⡱⡱⡱⡱⡣⡣⡣⡇⡇⣇⢧⢳⢹⡸⡭⣫⢯⣻⢾⣿⣳⣯⣷⣇⡧⣣⢣⡳⣸⣳⡯
⣳⢽⣳⣝⣗⡿⣯⣟⡮⣯⡳⣳⢹⢪⡪⡪⡪⡢⡣⢣⠣⡣⡣⡣⡣⡣⡣⡣⡣⡣⣣⢣⡳⣹⡪⣟⣞⣯⡿⣿⣿⣻⡿⣿⣾⣷⣿⣾⣯⡿
⡯⣟⣞⣞⡮⡯⣿⢾⢽⣺⡪⡧⡫⡪⡪⡪⡊⡢⡱⡑⡕⡱⡸⡘⡜⡜⡜⡜⡜⣜⢜⡎⣞⢮⣞⣗⣯⡿⣯⡷⣗⣟⣾⢯⡿⣽⡿⣟⣾⣻
⢽⣳⣳⢗⡯⣯⣻⢯⡗⡧⣳⢣⡫⣪⣪⡪⡪⡪⡦⡣⡇⣗⢳⢳⡓⡗⡵⡹⡹⢭⢳⡫⢯⡻⣪⢯⡷⡿⣿⣿⣽⣾⣯⣯⣿⣿⡿⣿⣻⢽
⣽⣺⣺⢽⢽⣺⣺⣻⢽⢽⢝⣝⢮⢳⢸⢜⢪⢣⢣⠣⡣⢣⠣⡣⡪⡪⡪⡪⡪⡣⡣⡫⡣⡯⣺⢝⢾⣫⡯⣿⣿⣾⢿⣻⣽⡳⡯⣳⢕⢯
⣺⣺⡺⡽⣝⣞⣞⡽⣝⣕⢧⢣⢣⠣⡣⡑⠕⢌⠢⡑⢅⠕⡑⡌⡪⡘⡌⡪⡊⡎⡎⡮⠺⢜⢪⠝⡎⡞⡮⡷⡿⣽⣫⢗⡷⣝⢽⢜⡕⡗
⡳⣕⢯⡫⣞⢮⢮⣫⢲⢣⠢⡣⡱⢩⢨⢨⠨⢊⠊⢌⢂⠑⠌⡂⡊⡂⡃⡃⡪⢨⢨⢘⢜⠸⡰⢱⢱⢹⢼⢯⣻⢺⡪⣗⢝⢮⢳⡹⡪⡝
⡝⡮⡳⣝⢮⡫⣻⢮⣇⢇⢣⠪⡐⢅⠢⡑⠨⡂⢅⢑⠄⠕⠡⢂⢊⠔⡈⡢⣨⢢⢆⢵⢐⠱⡘⢌⢎⠮⣺⢳⢕⢯⡺⡵⡹⣕⡳⡹⡪⡝
⢝⡎⡯⣪⢇⢯⡳⣝⢮⡳⣕⠬⡨⢂⠅⡊⠔⠨⢐⢐⠘⡭⡫⢕⡪⢺⢜⠮⣲⢭⣚⢎⣣⢑⢌⠪⡢⢫⢎⡗⣝⢵⢱⢳⣙⢆⢗⢝⢜⢮
⢮⢺⢺⡸⣹⢵⢹⢪⢣⡫⣺⢹⢔⡡⢊⠄⠅⠅⠅⡂⠅⠞⡪⣓⠭⢣⠝⡮⡱⢑⠲⡡⢳⢐⢌⠪⡘⡼⡱⡱⡱⡱⡣⡳⡸⡪⡪⡪⡣⡣
⢝⣜⢕⣝⢮⢪⢣⢣⢣⡓⡕⡝⡜⣎⢆⠊⠌⠌⡂⡂⠅⡊⠢⠐⠌⡂⡣⠨⢒⠡⢊⢐⢐⢅⠢⡑⢼⢪⠪⡊⢎⠪⡊⢎⠪⡊⡎⡎⡎⡮
⡕⡎⡗⡎⡎⡎⡎⡕⡕⡪⡪⡪⡪⢎⢞⡜⡌⡐⡐⠄⠅⡂⠅⠅⠅⠅⡂⢅⠢⢑⢁⠢⠡⡑⡐⢌⢞⢜⢌⢪⠸⡨⠪⡨⠪⡨⢢⠱⡘⡌
⢗⢝⢜⢜⠜⡜⢌⠪⡂⡇⡪⡸⡨⡣⢣⢓⢝⡔⡢⡨⠐⡠⠑⠨⢈⢂⢂⠢⡈⡂⠢⡈⡂⡢⠊⢔⡝⡜⢔⠅⠕⢌⠪⡐⡑⢌⠢⡑⢌⢢
⡮⡣⡣⡃⢇⢪⠸⡨⠢⡑⡱⡘⡌⢎⢪⢪⢪⢺⢌⢆⠣⢄⠡⢁⢂⢂⢂⢂⠢⢈⢂⢂⢂⠢⠡⡕⣕⢍⢆⠣⢣⠡⡑⢌⠌⢆⠕⠜⢌⠆
⡇⢇⢎⠜⡌⢆⠣⡊⡪⡨⢢⢑⠜⢌⢪⠸⡸⡸⣱⢣⠱⡑⢕⡐⢐⢐⢐⢐⠨⢐⠐⠄⢅⠌⢢⢣⢣⢣⢱⢑⢅⢕⠸⡐⢍⢆⠣⢍⢆⠇
⢇⢣⢑⠕⡌⢆⠣⡱⠨⡢⢱⠨⡊⡎⢜⠜⡜⡜⣜⢎⢧⢱⢑⢎⢆⢂⠔⡐⠨⠠⠡⡑⡐⠌⣜⢵⡹⡜⡎⡎⡆⡇⡇⢇⢣⢊⢎⢪⢢⠣
⢱⠡⡣⠱⡘⢔⡑⢅⠣⡊⢆⢇⢣⠱⡑⡕⡕⡕⡵⡹⡪⡎⡎⡎⡵⣅⢂⠪⠨⢊⠌⢔⠨⢸⣜⢧⣳⢝⡼⣸⢸⢸⢸⢸⢸⢸⢸⢸⢸⢸
⡜⢜⢌⢎⠪⡢⢪⢊⢪⠸⡐⡕⢜⢸⢸⢸⢸⢜⠮⣝⢵⡫⣎⢧⡫⡾⡔⢅⢅⠅⡌⠆⢕⣽⡺⣝⢮⡳⣝⢮⢪⢎⢎⢎⢎⢎⢎⢎⢎⢎
⡜⢜⠔⡅⢇⠎⡆⢇⢕⢕⢱⢱⢱⢱⢱⢱⢕⢗⣝⢮⣳⢝⡮⡳⣝⣽⣻⡰⡑⡌⡎⡎⣾⣳⢽⡺⡵⣝⣜⢎⢧⡣⡣⡣⡣⣣⢣⡣⡣⡏
⢱⢱⠱⡱⡱⡱⡑⡕⡕⡜⡜⡌⡎⡎⡮⣪⡳⣝⢮⡳⣝⢷⢝⣝⢷⢽⡾⣇⡇⣯⠺⡼⡯⣯⣗⢯⡳⣕⢧⢯⢮⡺⡜⣎⢞⢜⢼⡸⣪⡺
⢇⢇⢇⢇⢇⢎⢎⢎⢎⢎⢎⢎⡎⡧⣫⢲⢝⢮⣳⣫⢯⢯⢯⢾⢽⣫⣯⡷⣝⢮⡽⣽⡯⣷⢯⡯⣯⣞⣽⡺⡵⡽⣕⢧⣳⣝⣵⢽⢺⣪
⣜⢼⢸⢪⢪⢎⢞⢼⢸⢪⡪⣣⢳⡹⡼⣕⢯⣳⣳⡳⡯⡯⡯⣯⢯⣷⣳⣯⣷⣻⡾⣯⡿⣯⢿⣞⡷⡷⣷⢿⣿⣻⣟⢿⢽⡺⣕⢯⡺⣜
⢜⣜⢎⢧⢳⢕⣝⢜⢵⢕⢽⡸⡵⡝⣞⢮⡳⣵⣳⢽⢯⢿⢽⣳⣟⣾⣗⡷⡽⣻⢿⣷⢻⣯⣷⢷⣯⣿⢾⣝⣾⢺⣺⠽⣗⣟⣞⣗⡟⣾
⢇⡷⣝⡕⣗⢵⡣⡯⢮⡳⣝⢮⡳⣝⢮⣳⢽⡺⡮⣯⢿⣽⡿⣟⡯⣗⢷⢝⡽⣕⢯⡺⣝⢯⡳⣿⣿⣯⣽⣵⣾⣾⣽⣷⣽⣿⣷⣾⣮⣿`;

class EPORNER_RULES {
  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.numlist2',
  });

  container = [...document.querySelectorAll('#vidresults')].pop();

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbs(html) {
    return [...html.querySelectorAll('div[id^=vf][data-id]')];
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    const imgSrc = img?.getAttribute('data-src');
    img.classList.remove('lazyimg');
    if (img.src.includes('data:image')) {
      img.src = "";
    } else {
      return ({});
    }
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const uploader = sanitizeStr(thumb.querySelector('[title="Uploader"]')?.innerText);
    const title = sanitizeStr(thumb.querySelector('a')?.innerText).concat(` user:${uploader}`);
    const duration = timeToSeconds(thumb.querySelector('[title="Duration"]')?.innerText);
    return { title, duration };
  }
}

const RULES = new EPORNER_RULES();

//====================================================================================================

function videoPreview() {
  function handleThumbHover(e) {
    if (e.target.tagName !== 'IMG') return;
    const thumb = e.target.parentElement.parentElement.parentElement.parentElement;
    const id = thumb.getAttribute('data-id');
    show_video_prev(id);
  }

  RULES.container.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function route() {
  if (RULES.container) {
    parseData(RULES.container);
    videoPreview();
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
