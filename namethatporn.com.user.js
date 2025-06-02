// ==UserScript==
// @name         NamethatPorn Improved
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by solved/unsolved, include/exclude phrases.
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://namethatporn.*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=namethatporn.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.4/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==

const { timeToSeconds, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, JabroniOutfitUI, defaultSchemeWithPrivateFilter, defaultStateWithDurationAndPrivacy } = window.jabronioutfit;

const LOGO = `
⡳⣝⢮⡳⣝⢮⡳⣝⢮⢳⡣⣗⡳⡳⡳⣕⢗⣝⢮⡳⡽⣯⡿⣽⢯⡿⣽⡯⣿⢽⢿⢽⢯⢿⢽⢽⣫⢯⢯⢯⢯⢯⢯⣗⢯⣟⢮⢗⢽⡘⡐⣞⣯⢿⡽⣽⣺⣝⢮⡳
⣻⢺⣕⢯⡳⣝⡞⣮⡳⣝⡞⣼⢪⣏⢗⡵⣝⢮⡳⣝⡾⡯⣟⡯⣟⡽⡵⡯⣳⡫⡯⡫⣗⢽⢝⣕⢯⡫⣏⢯⣳⣫⡳⡵⣝⢮⡫⣏⢧⢅⣸⣽⣞⡯⣟⣞⡞⡮⡳⡱
⡷⣝⢮⣳⡫⣗⢽⡪⣞⢵⢝⡮⡳⣕⣗⢽⣪⣳⢽⡺⡺⡽⣕⡯⡮⣫⢺⢪⡺⢜⢎⢏⢮⢳⢕⢗⢵⢝⢮⢳⢕⣗⢽⡪⣗⢽⡺⣪⡳⣕⢕⡳⣯⢯⣗⢧⢯⢪⢣⠃
⣽⡺⣕⢷⢝⢾⢕⡯⣺⢝⡵⡽⣝⢮⢮⣗⡗⣗⣝⢮⢯⢯⢺⢜⢕⢕⢝⡜⡜⡕⡕⡇⡗⡕⣕⢝⡜⡵⡹⣕⡳⡕⣗⢝⢮⡳⡝⡮⡪⣎⢧⢳⠸⣝⢮⡳⡱⡱⢁⠊
⡷⣝⢷⢽⢽⢽⢕⡯⣺⢵⡫⣞⡕⡯⡳⢵⢝⢮⢪⡳⣝⢮⢣⢣⢣⢣⢣⢪⢪⠪⡪⢪⠪⡪⡪⡪⡪⣪⡚⡖⣕⢽⢸⢕⢗⢵⢝⢎⢧⡣⡇⣇⢳⠨⢳⠱⡑⠌⠠⠀
⣟⣞⢽⢝⣞⢽⣕⢯⡳⡳⡹⡜⡜⡎⡎⡇⡗⡕⡇⡯⣪⢪⢪⠪⡪⢊⠢⡃⢎⢊⢪⠸⡘⢜⢌⢎⢎⢖⢕⢝⢜⢎⢗⢭⣓⢧⢫⢎⢧⢳⢱⢱⡑⢌⢐⠱⠨⠐⠀⠀
⣗⣗⢯⢯⣞⢗⡳⡕⡇⡏⡎⡎⡪⢪⠸⡘⡌⡎⢎⢞⢜⠜⡐⠕⢌⠪⡨⢊⠢⡡⠅⠕⡅⢇⢎⢢⠣⡣⡣⡣⡳⡹⡸⡕⡮⣪⢳⡹⣪⢣⢫⢲⢑⢕⢐⠈⠌⠄⡁⠀
⣗⣗⢯⡗⡗⡇⡗⡕⢕⢑⡑⢌⢊⠢⡑⡌⢆⢣⢣⢣⠱⡨⢊⠜⡠⢑⠄⠕⡈⡢⢑⢑⠌⢆⠥⡑⡅⢇⢎⢎⢮⢪⡣⡳⡹⡜⣎⢞⡜⡎⣇⢇⢇⢇⢪⢐⠈⣂⢂⠁
⡷⣝⡗⡝⡎⡎⢎⠜⡨⢂⢊⠢⠡⡑⢌⠢⡑⡕⡅⡣⡑⠌⠔⡨⢐⠐⠌⠌⠢⠨⡂⠅⢕⢑⠌⢆⢎⢪⢢⢣⢣⢣⢣⡫⡺⣸⢪⢎⢮⢝⡜⣜⢕⢕⢕⠕⡌⠔⠔⠀
⣯⡳⣝⢜⢜⠌⢆⠕⡈⡂⠢⠡⢑⠨⠐⢅⠪⡢⡃⢆⢊⠌⡂⡂⡂⠅⠅⢅⢑⠡⠊⢌⠢⠢⡑⢅⠆⡕⢅⢣⢱⢱⢱⡱⣹⢸⢜⢮⢺⢜⢎⡞⣜⢕⢵⢱⢱⠡⠅⠄
⡳⡝⡜⡜⡌⡪⢂⠅⡂⡊⠌⠨⢐⠨⡈⡢⢱⠱⡨⢂⢂⢂⢂⠂⡂⠅⡁⡂⠢⠡⠡⠡⡊⢌⠌⢆⠕⢜⢘⢜⢜⢜⢜⡜⣜⢎⢇⡗⡵⣝⢜⢮⢺⢪⡣⣳⢱⡹⡨⡀
⡏⣞⢜⢜⢌⠢⡡⢂⢂⠂⠅⠅⡂⡂⠢⡊⢎⢌⠢⠡⢂⢂⠢⠨⠐⡈⠄⠌⠌⢌⢐⠡⡈⡢⢡⠱⡘⢌⠪⡢⡣⡣⡣⡣⣣⢳⢣⡫⣺⢸⢕⢽⡱⡳⣹⡪⡺⡜⡎⡆
⣝⢜⡜⡔⠥⡑⠔⡁⠔⢈⠄⠅⡐⠠⡑⡌⡎⡢⠣⡑⡁⠢⡈⡂⠅⠂⠅⢌⢐⢐⢐⠨⢐⠨⡐⢅⠪⡘⡌⡆⡇⡎⡎⡮⡪⡮⡳⡹⣜⢵⢝⢵⢝⢼⡪⡮⣳⢹⢪⡪
⡪⡇⡇⡎⡕⢅⠕⠠⡁⡂⢂⢁⢂⢑⠰⡸⡨⡸⡈⡢⢊⠔⡐⠄⠅⠅⠅⡂⡐⠄⡂⢌⢐⢁⠪⡐⢅⠕⡌⢆⢣⢣⢣⡣⣳⢱⢝⡺⣪⢳⡹⡵⣝⣕⢗⡽⢼⢕⢧⠳
⢵⡹⡸⡨⡢⡱⢨⠨⡀⡂⡂⡂⡂⡢⡑⢜⢌⢆⠎⡢⠡⡂⠢⠡⠡⢑⢐⠐⠄⢅⠐⡐⡐⡐⢅⢊⢢⠱⡘⡜⢜⢜⢜⢜⡜⣎⢧⡫⡮⡳⣝⢮⡳⣕⢗⡽⡵⣝⢮⢫
⢧⢳⡱⡱⣑⢌⠢⡑⡄⡂⡂⡂⡢⠢⡑⡕⡕⡅⡕⢌⠪⢐⠡⡡⠡⡡⠂⢅⠑⠄⢅⢂⠢⡈⡢⢊⢢⠱⡑⡜⡜⡜⡜⡕⣝⠼⡜⣎⣗⢽⣪⡳⣝⡮⣗⢽⡺⣚⢮⡣
⣹⢪⡪⡪⡢⡣⢱⠨⡢⢑⢐⢌⢂⠇⡕⡕⣕⢕⢜⢔⢑⠅⢕⢐⠅⡢⢑⠡⢊⠌⡂⡢⠡⡂⡪⡨⢢⢃⢣⢣⢣⢣⢫⢺⡸⡹⣜⢮⢮⡳⡵⣝⣞⢞⡮⣳⢽⡪⣗⡝
⢕⢧⢳⡱⡱⡱⡡⡃⡎⢌⢆⠕⡌⢎⢪⢪⡪⣎⢎⢎⢜⢸⠨⡢⠱⡨⡂⡣⡑⢌⠢⡊⡌⢆⠕⡜⢌⢎⢪⢪⢪⡪⡎⡧⣫⡺⡪⣞⢵⡫⣞⢵⡳⣝⡮⣗⢷⢝⡮⡺
⣏⢗⢧⢳⡹⣸⢸⢸⢘⢔⢅⢇⢎⢎⢇⢗⣝⢮⢧⡳⣱⢱⢱⢱⢑⢕⢌⢆⠪⡂⢇⢪⢘⠔⡕⡱⡱⡱⡱⡱⣱⢱⢝⣜⢮⡺⣝⢮⢗⡽⣺⢽⢝⣞⡮⡷⣝⢷⢽⢕
⣺⢝⡵⡳⣝⢜⢮⢺⢸⡸⡸⣸⢸⡪⡳⣕⢷⣝⣟⣾⣺⣎⣧⡳⣕⢕⢕⢕⢕⢕⢕⢕⢱⢱⢱⢱⢱⢸⢸⢪⡺⣜⢵⢕⢧⠯⡮⣫⢗⡯⣞⡽⡵⣳⣫⢯⡺⣝⣮⡳
⣯⣗⡯⡯⡮⣏⣗⢽⣱⡳⣝⢼⡪⣞⣽⣺⣽⡾⣿⣿⣿⡳⣳⣝⢮⡳⡝⣜⢜⢜⢜⢜⠜⡜⡜⡜⣜⢜⢵⡱⡵⡕⣗⢽⢕⡯⣫⢞⡽⣪⢷⢽⣝⣗⣝⢷⣝⣗⢧⢇
⢵⡳⡯⣯⣻⣺⢾⢽⣺⢾⢽⡽⡽⣗⡿⣞⣷⢿⣿⡿⡮⡯⡺⣜⢵⢝⢞⢎⡗⣝⢜⢼⢸⢪⡪⡎⡮⣪⡣⢧⡳⣝⢎⣗⢽⡪⣗⡽⣺⢵⣫⣗⣗⢷⢝⣗⣗⢷⢽⠸
⢿⣝⢽⣺⣺⡪⡯⡯⣺⢽⣕⢯⡻⡮⡯⣟⣾⢿⣿⢽⢽⢝⡽⡜⣎⢮⢳⢕⢧⢳⢹⡸⣱⢣⡣⡳⣹⡸⡼⡕⣗⢵⡳⡽⣕⣯⡳⣝⡮⣗⡧⣗⡾⡵⣯⣲⡳⡧⡯⢢`;

class NAMETHATPORN_RULES {
    delay = 350;

    constructor() {
        this.paginationElement = document.querySelector('#smi_wrp, #nsw_p');
        this.paginationLast = parseInt([...document.querySelectorAll('#smi_wrp a, #nsw_p a')].pop()?.href.match(/\d+/)?.[0] || 1);
        Object.assign(this, this.URL_DATA());
        this.CONTAINER = document.querySelector('#items_wrapper, #nsw_r');
    }

    IS_PRIVATE(thumb) {
      return !!thumb.querySelector('.item_solved, .nsw_r_slvd');
    }

    THUMB_URL(thumb) {
      return thumb.querySelector('a')?.href || thumb.href;
    }

    GET_THUMBS(html) {
      return [...html.querySelectorAll('.item, .nsw_r_w')];
    }

    THUMB_IMG_DATA(thumb) {
      const img = thumb.querySelector('img');
      const imgSrc = img.getAttribute('data-dyn')?.concat('.webp') || img.getAttribute('src');
      return ({ img, imgSrc });
    }

    THUMB_DATA(thumb) {
        const item_answer = sanitizeStr(thumb.querySelector('.item_answer b, .nsw_r_desc')?.innerText);
        const item_title = sanitizeStr(thumb.querySelector('.item_title, .nsw_r_tit')?.innerText);
        const title = `${item_title} ${item_answer}`;
        const duration = 0;
        return { title, duration };
    }

    URL_DATA() {
        const url = new URL(location.href);
        const paginationOffset = parseInt(url.searchParams.get('page')) || 1;

        const paginationUrlGenerator = n => {
            url.searchParams.set('page', n);
            return url.href;
        }

        return { paginationOffset, paginationUrlGenerator }
    }
}

const RULES = new NAMETHATPORN_RULES();

//====================================================================================================

function router() {
  if (RULES.CONTAINER) {
      handleLoadedHTML(RULES.CONTAINER);
  }

  if (RULES.paginationElement) {
    store.localState = store.stateLocale;
    createInfiniteScroller(store, handleLoadedHTML, RULES);
  }

  delete defaultSchemeWithPrivateFilter.durationFilter;
  new JabroniOutfitUI(store, defaultSchemeWithPrivateFilter);
}

//====================================================================================================

defaultSchemeWithPrivateFilter.privateFilter = [
  { type: "checkbox", model: "state.filterPrivate", label: "unsolved" },
  { type: "checkbox", model: "state.filterPublic", label: "solved" }];

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);
router();
