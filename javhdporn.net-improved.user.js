// ==UserScript==
// @name         javhdporn.net Improved
// @namespace    http://tampermonkey.net/
// @version      1.1.1
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.javhdporn.*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=javhdporn.net
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.6/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==

const { timeToSeconds, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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
  delay = 350;

  paginationElement = document.querySelector('.pagination');
  paginationLast = parseInt(
    Array.from(document.querySelectorAll('.pagination a') || [], (a) =>
      a.href.match(/\d+/g)?.pop(),
    )?.pop() || 1,
  );
  CONTAINER = this.GET_THUMBS(document.body)?.[0].parentElement;

  constructor() {
    Object.assign(this, this.URL_DATA());
  }

  THUMB_URL(thumb) {
    return thumb.querySelector('a').href;
  }

  GET_THUMBS(html) {
    return Array.from(html.querySelectorAll('article.thumb-block'));
  }

  THUMB_IMG_DATA(thumb) {
    return {};
  }

  THUMB_DATA(thumb) {
    const title = sanitizeStr(thumb.querySelector('header.entry-header')?.innerText);
    const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText);
    return { title, duration };
  }

  URL_DATA() {
    const url = new URL(location.href);
    const paginationOffset = parseInt(location.pathname.match(/\/page\/(\d+)/)?.pop() || 1);
    if (paginationOffset < 2) url.pathname = `${url.pathname}/page/${paginationOffset}/`;

    const paginationUrlGenerator = (n) => {
      return url.href.replace(/\/page\/\d+/, () => `/page/${n}`);
    };

    return { paginationOffset, paginationUrlGenerator };
  }
}

const RULES = new JAVHDPORN_RULES();

//====================================================================================================

function router() {
  if (RULES.CONTAINER) {
    handleLoadedHTML(RULES.CONTAINER);
  }

  if (RULES.paginationElement) {
    createInfiniteScroller(store, handleLoadedHTML, RULES);
  }

  new JabroniOutfitUI(store);
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);

router();
