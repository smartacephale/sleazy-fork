// ==UserScript==
// @name         Eporner.com Improved
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.eporner.*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=eporner.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.4.3/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.5/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==

const { timeToSeconds, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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
  delay = 350;

  paginationElement = document.querySelector('.numlist2');
  paginationOffset = 1;
  paginationLast = 999;

  CONTAINER = [...document.querySelectorAll('#vidresults')].pop();

  THUMB_URL(thumb) {
    return thumb.querySelector('a').href;
  }

  GET_THUMBS(html) {
    return [...html.querySelectorAll('div[id^=vf][data-id]')];
  }

  THUMB_IMG_DATA(thumb) {
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

  THUMB_DATA(thumb) {
    const uploader = sanitizeStr(thumb.querySelector('[title="Uploader"]')?.innerText);
    const title = sanitizeStr(thumb.querySelector('a')?.innerText).concat(` user:${uploader}`);
    const duration = timeToSeconds(thumb.querySelector('[title="Duration"]')?.innerText);
    return { title, duration };
  }

  paginationUrlGenerator = (n) => {
    const url = new URL(location.href);
    const [tag, search, offsetOrOrder, order] = url.pathname.split('/').filter(x => x);

    let newPathname = `/${tag}/${search}/${n}/`;

    if (offsetOrOrder || order) {
      const ord_ = /^\d+$/.test(offsetOrOrder) ? order : offsetOrOrder;
      newPathname = `${newPathname}${ord_}/`;
    }

    url.pathname = newPathname;
    return url.href;
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

  RULES.CONTAINER.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function route() {
  if (RULES.CONTAINER) {
    parseData(RULES.CONTAINER);
    videoPreview();
  }

  if (RULES.paginationElement) {
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
