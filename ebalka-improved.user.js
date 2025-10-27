// ==UserScript==
// @name         ebalka improved
// @namespace    http://tampermonkey.net/
// @version      2.0.1
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*ebalka.*.*/*
// @match        https://b.ebalka.zip/*
// @match        https://*.ebalk*.*/*
// @match        https://*.fuckingbear*.*/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wwwa.ebalka.link
// @downloadURL https://update.sleazyfork.org/scripts/509735/ebalka%20improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/509735/ebalka%20improved.meta.js
// ==/UserScript==

const { timeToSeconds, sanitizeStr, parseDom, DataManager, createInfiniteScroller, getPaginationStrategy } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

const LOGO = `
⣿⣿⣿⣿⣿⣿⢿⣻⣟⣿⣻⣽⣟⡿⣯⣟⣯⡿⣽⣻⣽⢽⢯⡿⡽⡯⣿⢽⣻⢽⡽⣽⣻⣿⣿⢿⣟⣿⣟⣿⣿⢿⣿⣿⣟⣿⣻⣿⣿⢿⣿⢿⡿⣿⢿⡿⣿⢿⣟⣿
⣿⣿⣿⣿⡿⣾⡿⣿⣽⣯⡿⣷⣟⣟⣷⣻⢾⣽⢽⣳⢿⢽⢯⢿⢽⢯⢿⡽⣞⣟⣞⣷⣿⣿⣾⢿⢿⢿⡽⣟⣿⣟⣿⡷⣿⣽⣟⣿⣽⣿⣻⣟⡿⣯⣿⣻⣿⣻⣯⣿
⣿⣿⣯⣿⣟⣿⣻⣯⣷⣿⣻⡷⣯⢷⣯⣯⢿⣺⢿⣽⣻⡽⣯⢿⢽⣻⣯⣿⢿⢾⡻⡫⡳⡱⡱⢱⠱⡱⡙⡜⡕⡯⡻⣻⣽⣾⣟⣷⡿⣯⣿⣽⣿⢿⣾⢿⣾⢿⣟⣯
⣿⣿⣻⣽⣿⡯⣿⢾⡷⣯⡷⣟⣯⣿⣳⣿⣻⡽⣟⡗⡟⡟⡽⡻⣛⢯⢻⢪⢳⢱⠱⡑⠕⡌⢌⠢⡑⢌⠢⡑⢌⢊⠎⡎⢮⢪⠯⣷⢿⣻⣽⣾⣻⣯⡿⣯⣯⢿⣽⣟
⣿⣿⢿⣿⣿⡽⣽⣯⢿⡽⣯⣿⢿⡽⡯⡳⣓⢝⠜⡜⢜⠸⡨⡊⢆⢣⠱⡱⡱⡡⡃⢎⠪⢐⠡⠊⠄⠅⠢⡈⡂⠅⡊⢌⢊⠎⡕⡕⡏⡿⣽⣾⢿⡷⣿⣻⢾⣟⣯⡿
⣿⣿⣿⡿⣾⢯⣗⣿⣽⢿⣻⢝⡗⡝⡎⡎⢆⠣⡑⢌⠢⢑⠐⢌⠢⠡⠣⡑⡱⡐⢌⠢⠡⡁⡊⠌⡨⢈⠂⢂⠂⠡⠨⢐⠐⠅⢕⢱⢱⢹⢸⡫⣿⣻⣗⣿⣟⣯⣯⢿
⣿⣿⣾⣿⡿⣽⣞⣿⣞⢟⡎⡗⡝⡜⢌⢊⠢⢑⠨⢐⠨⠠⠑⠄⠅⠕⡡⢑⢌⢌⠢⡑⠡⢂⠂⠅⡐⠠⠈⠄⡈⡈⢐⠐⠨⢈⠢⢑⠌⢎⢎⢎⢏⣷⣿⡷⣟⣷⣟⡿
⣿⣷⣿⣷⡿⣷⡿⡳⡕⣇⢏⢎⢎⢌⠢⠡⢊⢐⠨⠐⡈⠄⠅⠅⠅⠅⡂⢅⠢⡂⢕⠨⠨⢐⠨⠐⠠⢈⠐⠀⠄⠠⠀⠂⢁⠐⢐⠠⡁⡣⢊⠎⡎⡎⣿⣟⣿⡷⣟⣿
⣿⣿⣷⣿⣿⢿⡹⡱⡕⡕⡕⢕⠔⡂⢅⢑⠐⡀⡂⠡⠐⡈⠄⠡⡈⡂⠌⡐⡰⠨⢢⢡⢑⢐⠠⠁⠅⠠⠀⢁⠀⠂⠈⠀⠂⢈⠀⡂⠐⠄⢅⠣⡑⢕⢕⡻⣗⣿⣻⡷
⣿⣿⣯⢏⢾⢳⢱⢱⢱⢱⢑⠕⡨⢐⢐⠐⡈⠄⠄⡁⢂⠐⢈⠐⡀⢂⠅⡂⡪⡈⡪⡂⢎⡐⡨⠀⠅⠐⠈⠀⠀⠐⠈⠀⠁⠠⠀⠄⠡⠑⡐⡑⡘⠔⢅⢝⢽⣽⣯⢿
⣿⣷⡿⣵⢫⢪⢪⢪⠪⡢⡃⢅⠢⢁⠂⡂⠂⢂⠐⡀⠄⠂⡀⢂⠐⡐⢐⠌⡆⡕⡔⡕⡕⡌⡢⠡⠈⠄⠂⠀⠂⠀⠀⠀⠐⠀⠂⠈⠄⡁⡂⠢⠡⡑⢅⠪⡪⣿⢾⣟
⣿⣗⢭⢺⢸⢘⢔⢕⠱⡨⢌⠢⡁⡂⠅⠠⢁⠐⠀⠄⠐⠀⠄⠐⢀⠂⡡⢱⢱⢱⣏⣟⡎⡎⡢⢁⠅⠐⠀⠠⠀⠀⠀⠀⠂⠀⡈⢀⠂⡐⠠⠡⡑⢄⢑⠌⡪⣺⣟⢏
⣿⣯⢮⢣⠱⡑⡌⢆⠣⡊⡢⢁⠢⠠⠁⠅⠐⢈⠀⠂⠈⠀⠄⠁⠄⠂⠂⢕⠱⡹⡺⠾⡱⡑⢌⢐⠠⠁⡈⠀⠀⠀⠀⠀⢀⠀⠄⠠⠀⡂⠡⡁⡂⡂⡂⡑⢌⠮⢏⠢
⣿⡻⡪⡢⠣⡑⢜⠨⡊⡢⢊⢐⠌⡐⠡⢈⠐⠀⠄⠂⠈⠀⠀⠂⠐⢈⠨⠠⢑⠡⠣⠩⠨⢂⠅⡢⠨⠀⠄⠐⠀⠀⠂⠀⠀⡀⠄⠂⡐⠠⡁⡂⠔⢐⢐⠨⠢⡹⡐⢅
⣿⣞⢜⢌⠪⡘⢔⢑⠌⡂⡢⢂⠢⠨⢐⠠⠈⠄⠂⠀⠄⠈⠀⢈⠠⠀⢂⢁⠢⡑⡡⢑⢑⢔⠡⢂⠅⠅⠌⡀⠂⠠⠀⠐⠀⡀⠄⠂⠄⠅⡂⡐⠨⢐⢐⠨⡊⣎⠪⡢
⣿⡧⡣⡢⠣⡡⡑⢔⠡⢊⢐⠐⠌⠌⠄⢂⠡⠐⠀⡁⠀⠠⠈⠀⡀⠐⡀⢂⢂⢂⠢⢡⢑⠢⡁⡂⡊⠌⠔⡠⢈⠀⠂⡁⠄⡀⢂⠡⢁⢂⠂⠄⠅⡂⡂⠪⡰⡱⢑⢌
⣿⣯⢪⢸⠨⡢⢊⠢⡑⡐⡐⠡⠡⢁⠅⡂⠂⠌⠠⠀⠌⠀⠄⠂⡀⢂⢐⢐⢐⠄⢅⠅⡕⡑⢔⠐⢌⠌⡊⡐⡐⠨⠐⡀⢂⢐⠐⡈⡐⡀⡊⠨⢐⠐⢌⢊⢆⢇⢕⠢
⣿⣿⢕⢕⢱⢘⠔⡡⢂⠢⠊⠌⢌⢐⠐⠄⠅⠅⡡⢈⠐⠐⠐⡀⡂⠔⡐⡐⠅⢌⠢⡑⡸⣈⠢⡡⡑⡌⠔⡐⠨⠠⢁⠐⡀⢂⠂⡂⡐⡀⡂⠅⡂⡑⢔⢑⢜⢌⠢⣑
⣿⣿⣗⡕⡕⢜⢌⠢⡑⠌⢌⢊⢐⢐⠨⠨⡈⠢⢐⢐⠨⠨⠐⠄⡂⠅⢆⠪⡸⡐⡑⢌⢌⠆⢕⢰⢨⠢⢑⠨⢈⠐⡀⢂⠐⡀⢂⢐⢀⠂⠄⠅⡂⡪⡐⡅⡇⣕⣼⡺
⣿⣯⡿⣮⢪⢪⢂⢇⠪⡈⡂⡂⡂⠢⠨⢐⠈⢌⢐⢐⠨⠨⠨⠨⠠⡑⡐⢅⢂⠣⡪⡢⡱⡸⡨⡢⡣⢊⢐⠈⠄⢂⠐⡀⢂⠐⡀⡂⡐⠨⠨⠨⡂⡢⢪⠸⣜⢮⢖⣝
⣿⣷⢿⣟⣧⡣⡣⡢⡃⡪⢐⢐⠌⠌⡨⢐⠨⢐⠠⠂⠌⠄⠅⡡⠡⠐⡐⡐⡐⢅⠪⣎⢮⢮⣫⢿⡘⢔⠠⡁⢊⢀⠂⡐⠠⠨⢀⢂⠂⠅⢕⠡⢒⠌⡆⡯⢮⡳⡝⡮
⣿⡿⣯⣿⣽⣷⡕⡕⡌⡪⡐⠅⢌⢂⢂⠢⠨⢐⠠⠡⢁⢊⠐⡀⡂⠅⡐⡐⠄⡑⢜⡺⡝⣗⡏⠎⡎⡆⢅⠂⢅⠐⡐⠠⢁⠊⠄⡂⠅⠕⡁⣊⠢⡣⣱⢽⡳⡽⡺⣝
⣿⣿⣯⣷⡿⣾⢿⣮⢪⢢⠱⡑⢅⠢⡂⠅⢅⠢⠨⢈⢐⢀⢂⢂⢐⢐⠠⠂⠅⡊⡢⡫⣪⠯⡊⢌⠪⡪⡂⢕⠠⡁⡂⠅⡂⠅⠅⡢⠡⡑⢌⠢⡣⡱⣕⢗⣝⢮⡫⡮
⣿⣷⢿⣷⢿⣿⣻⣯⡷⣇⢇⡣⢅⠕⢌⢌⠢⠨⠨⡐⡐⡐⡐⠄⡂⠔⡈⠌⢌⠢⡣⣣⢏⠪⡐⠅⡅⡕⡕⡅⢆⠢⢂⠅⡢⠡⡑⡐⢅⠪⡘⡜⡜⡮⣎⢗⣕⢧⢳⡹
⣿⣟⣿⣟⣿⣽⢿⣾⣻⡿⡑⡕⣕⢱⠡⡢⢑⠅⢕⢐⢐⠔⡐⡁⡂⠅⡂⢅⢅⢕⢽⢱⠡⡃⡪⡨⢢⢱⡹⡸⡐⡅⠕⢌⠢⡑⡰⠨⡂⢕⢱⡸⡺⡜⡮⣳⡱⣝⢵⡹
⣿⣿⣽⣿⣽⢿⣻⣷⢿⡑⠔⢅⢕⢕⢕⢜⢐⠅⢕⢐⠔⡐⠔⡐⠌⢌⠢⢑⠔⡕⡕⢕⢑⢌⠢⡊⢆⠣⡣⡫⡪⡪⡊⢆⢕⠰⡨⠢⡑⡕⡵⣹⢪⡳⣝⢮⢺⢜⢮⡪
⣿⣟⣷⢿⣾⢿⣿⣽⡏⡎⠜⢌⢢⢱⢱⢱⡑⡕⢅⠢⡊⡐⠅⡌⢌⠢⡊⡢⢣⢣⠪⡊⢆⢅⠣⡊⢌⠪⡘⢜⢜⠜⡜⢔⢅⠕⡜⡸⡸⡸⡺⣜⣕⢯⢺⡪⣳⢹⡪⡺
⣿⣿⣽⣿⣽⡿⣿⢾⠣⡊⡪⡊⢎⢌⢢⢑⢕⢕⢕⢱⢨⠨⡊⢔⢡⠱⡨⡪⡪⡪⡪⡘⢔⢡⢑⢌⢢⢣⡪⡘⡜⡜⡸⡐⡅⡣⡱⡡⡳⣙⢞⢼⡸⣕⢗⢽⡸⡵⣹⢹
⣿⣾⣷⡿⣾⡿⣿⡏⡎⡪⡘⢌⠢⡢⡑⡕⠔⢕⢕⢕⢜⢌⢎⢢⠱⡑⡕⢜⢜⢜⡢⡣⡣⡪⡂⣎⢍⢗⢷⡐⡌⢎⢆⠕⢜⢌⢎⢎⢎⢎⢗⢧⡫⣎⢗⡵⣝⢞⢼⡱
⣿⣿⣷⣿⡿⣿⡿⣗⡑⡌⡊⡆⢕⠌⢆⠪⡊⡆⢕⢕⢕⢕⢕⢱⢱⢑⠕⡕⢕⢕⢬⡣⢎⠎⡎⡆⡇⣯⣻⣿⣮⡆⡧⡹⢰⠱⡸⡘⡌⢎⢪⢣⢯⢎⣗⣝⡎⣗⢧⡫
⣿⣿⣷⣿⢿⣿⣿⢣⠪⡪⢪⠸⡰⡑⡕⡱⡑⡌⢆⢕⢧⢣⢣⢣⢣⢣⠣⡣⡣⣳⣵⢱⢱⣱⣱⢜⣵⣿⣽⣿⣿⣿⡜⡜⡸⡘⠔⢅⢊⢢⢑⢅⠗⣗⢵⢺⡺⣪⢞⢮
⣿⡻⣷⣿⣿⣿⣽⡪⡊⡎⡪⡊⢆⢣⢊⠆⡕⢌⢆⢕⢧⢣⢣⠣⡣⠣⡣⡣⡣⣻⣿⣷⣿⣿⣿⣷⣿⣿⣯⣷⣿⣿⣿⣜⢔⢌⢕⠡⢊⠔⢌⢂⢇⠳⣝⣗⢯⡺⣕⣗
⣿⣝⢞⢿⣻⣾⡿⣇⢣⢣⢑⢎⢪⠢⡣⡱⡸⡨⡢⡃⡗⡕⡕⢕⡑⡅⡣⡱⡸⣸⣿⣿⣿⣿⣾⣿⣻⣾⣿⣻⣿⣽⣿⣿⣎⠢⡢⢑⠔⡨⢂⠕⡰⢩⢚⡮⣳⢝⣞⢮
⣿⣞⢽⢵⢝⡯⡽⣸⡪⡢⡣⡣⡱⡑⡜⢔⢱⠨⡢⡊⡞⡜⢜⠔⡜⣐⠱⡨⢪⠪⣿⣿⣿⣿⣿⣻⣿⣿⣿⣿⣿⣿⡿⣳⣳⢕⢌⠢⡊⡐⡐⡡⢊⠢⡃⢯⣳⣻⡺⡵
⣿⣞⢽⣕⢯⣺⢝⣿⡎⡎⡎⢆⢇⢎⢪⢊⢆⢣⢒⠜⣎⢎⢎⠪⡢⡂⡣⢊⠆⡝⢼⣫⡯⡯⣟⣿⢷⣿⣯⣿⢟⣗⢯⢞⡾⣇⢇⢕⢐⠅⡂⡊⠔⡑⠜⡜⣺⣺⡺⡽
⣿⣞⢗⣗⢯⣞⢽⡺⣝⡜⡜⡜⡜⡜⡜⡔⡕⢕⢱⣑⡧⡣⡊⢎⠔⢌⠢⡡⢱⠸⡸⣺⡽⣽⣳⢽⢽⣺⢝⣮⣳⢳⡫⣗⡿⡽⡪⡢⡑⢌⢂⠪⠨⡨⠪⡸⢸⢮⢯⢯`;

class EBALKA_RULES {
  container = [...document.querySelectorAll('.content__video')].pop();
  HAS_VIDEOS = !!document.querySelector('.card_video');

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.pagination:not([id *= member])'
  });

  getThumbs(html) {
    return html.querySelectorAll('.card_video');
  }

  getThumbImgData() { return ({}); }

  getThumbUrl(thumb) {
    return thumb.querySelector('.root__link').href;
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('.card__title').innerText);
    const duration = timeToSeconds(
      [...thumb.querySelector('.card__spot').children].pop().innerText,
    );
    return { title, duration };
  }
}

const RULES = new EBALKA_RULES();

//====================================================================================================

function animateThumb(thumb) {
  const el = thumb.querySelector('.card__thumb_video');
  const src = el.querySelector('.card__image').getAttribute('data-preview');

  el.classList.add('video-on');

  const videoElem =
    parseDom(`<video style="position: absolute; left: 0px; top: 0px; width: 330px; height: 187px; visibility: visible; margin-top: -1px;"
                            autoplay="" loop="" playsinline="true" webkit-playsinline="true" src="${src}"></video>`);
  el.appendChild(videoElem);

  return {
    removeElem: () => {
      el.classList.remove('video-on');
      videoElem.remove();
    },
  };
}

function animate() {
  function handleThumbHover(e) {
    if (e.target.tagName !== 'IMG') return;
    const thumb = e.target.parentElement.parentElement.parentElement;
    const { removeElem } = animateThumb(thumb);
    thumb.addEventListener('mouseleave', removeElem, { once: true });
  }

  RULES.container.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function route() {
  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  if (RULES.HAS_VIDEOS) {
    animate();
    parseData(RULES.container);
    new JabroniOutfitUI(store);
  }
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
