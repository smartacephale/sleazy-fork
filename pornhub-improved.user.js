// ==UserScript==
// @name         PornHub Improved
// @namespace    http://tampermonkey.net/
// @version      2.3.1
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.pornhub.com/*
// @exclude      https://*.pornhub.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pornhub.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.6/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.meta.js
// ==/UserScript==

const { watchElementChildrenCount, getAllUniqueParents, timeToSeconds, sanitizeStr, findNextSibling, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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
    delay = 350;

    IS_MODEL_PAGE = location.pathname.startsWith('/model/');
    IS_VIDEO_PAGE = location.pathname.startsWith('/view_video.php');
    IS_PLAYLIST_PAGE = location.pathname.startsWith('/playlist/');

    paginationElement = document.querySelector('.paginationGated');
    paginationOffset = parseInt(new URLSearchParams(location.search).get('page')) || 1;
    paginationLast = parseInt(document.querySelector('.page_next')?.previousElementSibling.innerText) || 1;

    CONTAINER = [...document.querySelectorAll('ul.videos:not([id*=trailer]):not([class*=drop])')].pop();
    intersectionObservable = this.CONTAINER && findNextSibling(this.CONTAINER);

    constructor() {
      if (this.paginationLast === 10) this.paginationLast = 999;
    }

    THUMB_URL(thumb) {
      return thumb.querySelector('.linkVideoThumb').href;
    }

    GET_THUMBS(html) {
      const parent = [...html.querySelectorAll('ul.videos:not([id*=trailer]):not([class*=drop])')].pop() || html;
      return [...parent.querySelectorAll('li.videoBox.videoblock, li.videoblock')];
    }

    THUMB_IMG_DATA(thumb) {
      const img = thumb.querySelector('.js-videoThumb.thumb.js-videoPreview');
      const imgSrc = img?.getAttribute('data-mediumthumb') || img?.getAttribute('data-path').replace('{index}', '1');
      if (!img?.complete || img.naturalWidth === 0) { return ({}); }
      return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const name = sanitizeStr(thumb.querySelector('.usernameWrap')?.innerText);
        const title = sanitizeStr(thumb.querySelector('span.title')?.innerText).concat(` user:${name}`);
        const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText);
        return { title, duration };
    }

    paginationUrlGenerator = (n) => {
      const url = new URL(location.href);
      url.searchParams.set('page', n);
      return url.href;
    }
}

const RULES = new PORNHUB_RULES();

//====================================================================================================

function route() {
  if (RULES.IS_VIDEO_PAGE) {
      const containers = getAllUniqueParents(document.querySelectorAll('li.js-pop.videoBox, li.js-pop.videoblock')).slice(2);
      containers.forEach(c => handleLoadedHTML(c, c));
  }

  if (RULES.CONTAINER) {
      handleLoadedHTML(RULES.CONTAINER);
  }

  if (RULES.IS_PLAYLIST_PAGE) {
      handleLoadedHTML(RULES.CONTAINER);
      watchElementChildrenCount(RULES.CONTAINER, () => handleLoadedHTML(RULES.CONTAINER));
  }

  if (RULES.paginationElement) {
    createInfiniteScroller(store, handleLoadedHTML, RULES);
  }

  new JabroniOutfitUI(store);
}

//====================================================================================================

console.log(RULES);


//console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
