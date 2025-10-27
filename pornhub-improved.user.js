// ==UserScript==
// @name         PornHub Improved
// @namespace    http://tampermonkey.net/
// @version      3.0.1
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.pornhub.com/*
// @exclude      https://*.pornhub.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pornhub.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.meta.js
// ==/UserScript==

const { watchElementChildrenCount, getAllUniqueParents, timeToSeconds, sanitizeStr, findNextSibling, DataManager, createInfiniteScroller, getPaginationStrategy } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

const LOGO = `
⣞⣞⣞⣞⣞⣞⣞⣞⢞⣖⢔⠌⢆⠇⡇⢇⡓⡆⢠⠰⠠⡄⡄⡠⡀⡄⣄⠢⡂⡆⢆⢆⢒⢔⢕⢜⢔⢕⢕⢗⣗⢗⢗⢕⠕⠕⢔⢲⣲⢮⣺⣺⡺⡸⡪⡚⢎⢎⢺⢪
⣺⣺⣺⣺⣺⣺⡺⣮⣳⣳⡳⣕⢥⠱⡘⢔⠱⠑⠡⣫⠈⡞⢼⠔⡑⡕⢕⢝⢜⢜⢜⢔⢅⢣⠪⡸⢸⠸⡸⡱⡑⢍⠢⡑⢌⢪⢨⢪⣺⡻⣗⣷⡿⣽⣺⡦⡵⣔⢷⢽
⣺⣺⣺⣺⣺⣺⢽⣺⣺⣺⣺⣺⣪⢣⡑⡠⠐⠈⠨⡪⣂⠉⡪⡪⡆⢕⠅⡕⢕⢕⢕⢕⢕⢕⠱⡨⠢⡑⢌⢂⢊⢆⢕⠸⡨⢢⠱⡑⡜⡎⡞⡮⡯⡯⡯⡻⡽⡽⡽⣽
⣺⣺⣞⣞⣞⡾⣽⣺⣺⣺⣺⣺⢮⡳⡽⣔⢔⢈⠐⠈⡎⡀⠅⢣⢫⡢⡑⠌⢜⠸⡸⡸⡱⠡⡱⢐⢅⠪⡐⡅⢕⠌⢆⠣⡊⢆⠣⡑⢌⠪⡊⡎⡎⡗⡝⡜⡜⢜⢹⢸
⣞⣞⣾⣺⣳⢯⣗⣿⣺⣳⣗⡯⣗⡯⣟⣮⡳⣧⡳⣢⢢⠐⢰⣀⠂⡑⢕⠨⢂⠕⡑⢌⠢⠡⠠⡁⢂⢑⠨⠠⠡⡈⡂⡢⡂⡆⣆⡪⡨⡊⡂⠎⡢⡑⢕⢱⢘⢌⢎⢎
⣳⣳⣳⣻⣺⢽⣺⣗⡿⣞⣷⣻⣗⣯⣗⣗⣟⡮⡯⣮⡳⡳⡔⡨⢆⠂⠱⡌⡐⠌⡂⠅⢅⠣⡑⢌⠢⡢⡑⡱⡡⡣⡣⡣⡳⣝⢮⣟⣿⣿⣿⣦⡈⢎⢎⢪⣪⢮⣳⣳
⣺⣺⣳⣻⣞⣿⣺⢷⣟⣯⣿⣽⢿⣾⣳⣟⣮⢯⣟⢮⢯⢯⢮⢪⠪⡊⡈⢆⠢⢑⠨⠨⠢⡑⢌⠢⣃⢪⠨⡢⠱⡘⢜⢜⢜⢜⢗⣝⡯⡿⡿⣟⢦⣕⣞⣾⣺⣻⣞⣾
⣺⣞⣷⣳⣟⣾⡽⣯⣟⣯⣿⣾⣿⣻⣽⣾⣽⣻⣺⢽⢽⢯⡯⣧⡣⡓⡔⠠⡑⠄⢕⠡⡑⢌⢢⢑⠔⡐⠅⠪⠨⢊⢢⢑⢕⢕⢕⢕⠱⡑⢕⢕⢗⣿⣺⣯⢿⣳⣟⢾
⣞⣾⣺⣞⡷⣗⣿⣽⡾⣿⣟⣿⣟⣿⣿⣷⣿⣽⢾⡽⣽⢽⣽⣳⢽⡜⡌⢦⢘⢌⠢⡑⡌⢆⠕⡐⡁⠂⢅⠪⡘⢌⢪⠨⡢⡃⢎⠢⡑⢅⠕⢌⢎⣞⣞⢾⣝⣞⡮⡯
⢷⣳⣗⡯⣟⡷⣿⢾⣻⣟⣿⣻⣿⣿⢿⣿⣾⣟⣿⢯⣯⣟⡾⣽⢯⣯⢯⣇⢇⢆⢣⠱⡘⡐⡁⡂⡐⠅⡅⢕⠸⡨⠢⡑⡰⢡⠡⡊⢌⠢⡑⡑⢜⢜⢮⠳⢓⢣⢫⢮
⢽⣺⢾⣽⣳⣟⣟⣿⣯⣿⣿⣿⣿⣿⣿⣿⣻⣿⣻⡿⣞⣷⣻⣽⣻⣞⣿⡾⡵⡱⡡⢑⠈⠄⠂⠄⠂⡑⠨⡂⡣⡊⡪⢂⢎⠢⡃⡪⠢⣑⢱⡨⡮⣺⣖⠈⡜⢜⢼⢽
⢽⣺⢽⣞⣾⣳⡯⣷⢿⡷⣿⣿⣻⣿⣟⣿⣽⣿⣻⣟⣯⡿⣞⣷⣻⣞⣷⣻⡳⡑⡅⠅⠠⠁⠌⡠⠁⠄⢅⢐⢐⠌⢔⠡⡢⢱⠨⡊⡎⡎⡮⡪⡯⡳⠡⡪⡪⡪⣯⣿
⢽⣺⢽⣺⣳⢯⡿⣽⣟⣿⣻⣿⡿⣿⡿⣿⣿⣻⣯⣿⢷⣻⡽⣞⣷⣳⣳⡳⡱⡐⠄⡁⡂⡁⢂⠂⢅⠕⢅⢊⠢⡑⢡⢑⢌⣂⡣⡑⡅⣇⢇⢧⢕⢜⢜⢜⢮⢯⣿⣺
⡻⡮⣟⣾⣺⢽⢯⣗⣿⣺⣽⡷⣿⣿⢿⣿⣯⣿⣯⣿⢿⣽⣻⡽⣞⣞⡞⡎⡎⠄⢂⠐⡀⡂⢅⠪⡐⡅⠇⠅⢂⠪⡐⠅⢕⠰⡑⡝⡜⡜⡎⡎⡎⡎⡎⢎⢎⢗⣗⢷
⢯⣻⣺⣺⣺⢽⢯⢷⣻⣞⣷⢿⣻⣾⢿⣯⣿⡷⣿⣻⣯⡷⣯⣟⣷⡳⣝⢜⢜⠀⡂⠌⡐⢌⢢⢱⠨⡪⠨⠨⠀⠅⠊⢌⠢⡑⡑⢌⠎⡪⢊⢎⢊⠆⡊⡢⢂⢣⢣⣳
⣳⣳⣳⡳⡽⡽⡯⣟⣾⣺⢽⡯⣷⣟⣿⣳⣿⢽⣯⢿⡷⣟⣷⣻⢾⣝⢮⡪⡪⡀⡂⠌⡌⡪⠢⡃⡇⡕⢕⠅⡅⢅⢑⠄⠅⡊⢌⠢⡑⢌⢢⢱⡰⣕⠒⡀⡊⡆⣗⢷
⣺⡺⡮⡯⡯⡯⡯⣗⡷⣯⢯⡯⣗⣯⢷⣻⣞⣯⣟⣯⣟⣯⣿⢽⣻⣺⢵⢝⢮⢢⢂⢑⢌⠪⡪⢸⢨⢪⢪⢪⢪⢪⢢⢪⢪⢢⢱⢸⡸⣜⢮⢳⢱⡁⡜⣌⢆⢗⢕⢽
⢞⢮⢯⢯⢯⢯⢯⣗⡯⣯⢯⣟⣷⣻⡯⣟⡷⣟⣷⢯⡿⣾⡽⣯⡿⣾⢽⢽⡱⡱⡱⢐⠔⡑⠜⡌⡎⡎⡮⡪⡣⣏⢮⡣⡳⣕⢕⢧⢯⡪⠣⡣⢃⢇⢣⢣⢳⣕⡯⣯
⢝⣝⢽⢝⢽⣝⣗⣗⢯⢯⣟⢾⣺⣳⢯⡯⡿⣽⣞⣯⢿⣳⡿⣽⢯⢿⣽⣳⢝⡎⢌⠢⡑⢌⢪⠸⡸⡸⡸⡜⡮⣪⡳⣝⣕⣗⢽⢽⡕⢌⢪⢰⡱⡴⡵⡽⡽⣮⣻⡺
⡳⡵⡹⡽⣕⣗⢷⢽⣝⣗⡯⣟⣞⡾⡽⡽⡯⣗⣗⡿⣽⣗⣿⢽⡯⣿⣞⡾⣝⡎⡢⢑⢌⢢⠱⡑⡕⡕⡕⡝⡜⡮⣺⣪⡺⡮⡯⣗⣿⢵⣳⣳⢯⢯⢯⢯⣻⣺⡪⡊
⡯⡪⡯⣺⡺⡪⣯⣳⣳⡳⣯⣳⡳⣯⣻⢽⢯⣗⡷⡯⣗⡷⡯⡿⡽⣗⣯⢯⣗⣇⢊⠔⠔⡅⡣⡱⡸⡸⡸⡸⡸⡪⡺⣜⢮⢯⢯⡯⣿⢽⣺⣺⢽⢽⣝⣗⢗⠕⡁⡂
⡯⡺⣪⢺⣪⣻⣺⡺⣮⣻⣺⡺⣽⣺⡺⡽⡽⡮⡯⡯⣗⡯⣿⢽⢯⣗⡯⣟⣞⣎⠐⢌⠪⡂⠑⠌⡆⢇⢇⢇⢇⢏⢮⡪⡫⣯⡳⡯⡯⣟⣞⢮⢯⣳⡳⡕⠅⠅⡀⢂
⡮⡪⡪⡳⡵⣕⢗⣝⣞⣞⢮⣻⡺⡮⡯⡯⡯⣯⢯⣟⡾⣽⢽⡽⣽⡺⣽⣳⡳⡕⡈⡢⢑⠌⡄⢔⠸⡘⡜⡜⡜⡜⡜⣎⢯⢮⢯⢯⢯⡳⡽⣝⣗⢕⠇⠁⠀⠂⡂⠂`;

class PORNHUB_RULES {
  IS_MODEL_PAGE = location.pathname.startsWith('/model/');
  IS_VIDEO_PAGE = location.pathname.startsWith('/view_video.php');
  IS_PLAYLIST_PAGE = location.pathname.startsWith('/playlist/');

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.paginationGated',
    fixPaginationLast: (n) => n === 10 ? 999 : n
  });

  container = [...document.querySelectorAll('ul.videos:not([id*=trailer]):not([class*=drop]):not([class*=premium]):not([id*=bottom])')].pop();
  intersectionObservable = this.container && findNextSibling(this.container);

  getThumbUrl(thumb) {
    return thumb.querySelector('.linkVideoThumb').href;
  }

  getThumbs(html) {
    const parent = [...html.querySelectorAll('ul.videos:not([id*=trailer]):not([class*=drop]):not([class*=premium]):not([id*=bottom])')].pop() || html;
    return [...parent.querySelectorAll('li.videoBox.videoblock, li.videoblock')];
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('.js-videoThumb.thumb.js-videoPreview');
    const imgSrc = img?.getAttribute('data-mediumthumb') || img?.getAttribute('data-path').replace('{index}', '1');
    if (!img?.complete || img.naturalWidth === 0) { return ({}); }
    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const name = sanitizeStr(thumb.querySelector('.usernameWrap')?.innerText);
    const title = sanitizeStr(thumb.querySelector('span.title')?.innerText).concat(` user:${name}`);
    const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText);
    return { title, duration };
  }
}

const RULES = new PORNHUB_RULES();

//====================================================================================================

function route() {
  if (RULES.IS_VIDEO_PAGE) {
    const containers = getAllUniqueParents(document.querySelectorAll('li.js-pop.videoBox, li.js-pop.videoblock')).slice(2);
    containers.forEach(c => { parseData(c, c) });
  }

  if (RULES.container) {
    parseData(RULES.container);
  }

  if (RULES.IS_PLAYLIST_PAGE) {
    parseData(RULES.container);
    watchElementChildrenCount(RULES.container, () => parseData(RULES.container));
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
