// ==UserScript==
// @name         ebalka improved
// @namespace    http://tampermonkey.net/
// @version      1.2.2
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*ebalka.*.*/*
// @match        https://*.ebalk*.*/*
// @match        https://*.fuckingbear*.*/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.6/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wwwa.ebalka.link
// ==/UserScript==

const { timeToSeconds, sanitizeStr, parseDom, DataManager, createInfiniteScroller, parseDataParams } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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
  delay = 250;

  paginationElement = [...document.querySelectorAll('.pagination')].pop();
  CONTAINER = [...document.querySelectorAll('.content__video')].pop();
  HAS_VIDEOS = !!document.querySelector('.card_video');

  constructor() {
    const dataparams = parseDataParams(
      document.querySelector('.pagination__item.last').getAttribute('data-parameters'),
    );
    const lastfrom =
      dataparams[
        Object.keys(dataparams)
          .filter((k) => k.includes('from'))
          ?.pop()
      ];
    this.paginationLast = parseInt(lastfrom) || 1;
    Object.assign(this, this.URL_DATA());
  }

  GET_THUMBS(html) {
    return html.querySelectorAll('.card_video');
  }

  THUMB_IMG_DATA() {
    return {};
  }

  THUMB_URL(thumb) {
    return thumb.querySelector('.root__link').href;
  }

  THUMB_DATA(thumb) {
    const title = sanitizeStr(thumb.querySelector('.card__title').innerText);
    const duration = timeToSeconds(
      [...thumb.querySelector('.card__spot').children].pop().innerText,
    );
    return { title, duration };
  }

  URL_DATA() {
    const url = new URL(window.location.href);
    const paginationOffset =
      parseInt(
        document.querySelector('.pagination__item_active,input.pagination__item').innerText,
      ) || 1;
    const el = document.querySelector('.pagination__item.next');

    const attrs = {
      mode: 'async',
      function: 'get_block',
      block_id: el?.getAttribute('data-block-id'),
      ...bhutils.parseDataParams(el?.getAttribute('data-parameters')),
    };

    Object.keys(attrs).forEach((k) => url.searchParams.set(k, attrs[k]));

    const paginationUrlGenerator = (n) => {
      Object.keys(attrs).forEach((k) => k.includes('from') && url.searchParams.set(k, n));
      url.searchParams.set('_', Date.now());
      return url.href;
    };

    return { paginationOffset, paginationUrlGenerator };
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

  RULES.CONTAINER.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function route() {
  if (RULES.paginationElement) {
    createInfiniteScroller(store, handleLoadedHTML, RULES);
  }

  if (RULES.HAS_VIDEOS) {
    animate();
    handleLoadedHTML(RULES.CONTAINER);
    new JabroniOutfitUI(store);
  }
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
