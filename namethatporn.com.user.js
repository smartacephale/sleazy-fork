// ==UserScript==
// @name         NamethatPorn Improved
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://namethatporn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=namethatporn.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// ==/UserScript==

const { getPaginationStrategy, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const {
  JabroniOutfitStore,
  JabroniOutfitUI,
  defaultSchemeWithPrivacyFilter,
  defaultStateWithDurationAndPrivacy,
} = window.jabronioutfit;

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
  container = document.querySelector('#items_wrapper, #nsw_r');

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '#smi_wrp, #nsw_p',
  });

  isPrivate(thumb) {
    return !!thumb.querySelector('.item_solved, .nsw_r_slvd');
  }

  getThumbUrl(thumb) {
    return thumb.querySelector('a')?.href || thumb.href;
  }

  getThumbs(html) {
    return [...html.querySelectorAll('.item, .nsw_r_w')];
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    const imgSrc = img.getAttribute('data-dyn')?.concat('.webp') || img.getAttribute('src');
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const item_answer = sanitizeStr(thumb.querySelector('.item_answer b, .nsw_r_desc')?.innerText);
    const item_title = sanitizeStr(thumb.querySelector('.item_title, .nsw_r_tit')?.innerText);
    const title = `${item_title} ${item_answer}`;
    const duration = 0;
    return { title, duration };
  }
}

const RULES = new NAMETHATPORN_RULES();

//====================================================================================================

function router() {
  if (RULES.container) {
    parseData(RULES.container);
  }

  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  new JabroniOutfitUI(store, defaultSchemeWithPrivacyFilter);
}

//====================================================================================================

delete defaultSchemeWithPrivacyFilter.durationFilter;
defaultSchemeWithPrivacyFilter.privacyFilter = [
  { type: 'checkbox', model: 'state.filterPrivate', label: 'unsolved' },
  { type: 'checkbox', model: 'state.filterPublic', label: 'solved' },
];

//====================================================================================================

function monkeyPatchConfirm() {
  // const realConfirm = unsafeWindow.confirm;
  unsafeWindow.confirm = () => true;
}

monkeyPatchConfirm();

window.addEventListener(
  'keydown',
  (event) => {
    if (event.key === 'c') {
      const name = document.querySelector('#loggedin_box_new_username').innerText;
      if (!document.querySelector(`.ida_confirm_usernames a[href$="${name}.html"]`)) {
        document.querySelector('.id_answer_buttons > .iab.iac').click();
      }
    }
  },
  { once: true },
);

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);
router();
