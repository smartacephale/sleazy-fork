// ==UserScript==
// @name         PornHub Improved
// @namespace    http://tampermonkey.net/
// @version      2.1.2
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

class UNIVERSAL_RULES {
  static parsePagination(document) {
    const paginations = document.querySelectorAll('.pagination');
    return Array.from(paginations).pop();
  }

  static parsePaginationLast(pagination) {
    const el = pagination.querySelector('.last-page');
    return parseInt(el.innerText) || 1;
  }

  static parseThumbData(thumb, thumbCallback) {
    const uploader = bhutils.sanitizeStr(thumb.querySelector('[class*=name]')?.innerText);
    let title = bhutils.sanitizeStr(thumb.querySelector('[class*=title]')?.innerText);
    let duration = bhutils.sanitizeStr(thumb.querySelector('[class*=duration]')?.innerText);

    if (uploader) {
      title = title.concat(` user:${uploader}`);
    }

    duration = bhutils.timeToSeconds(duration);

    if (thumbCallback) {
      thumbCallback();
    }

    return { title, duration }
  }
}

class PORNHUB_RULES {
    delay = 350;

    constructor() {
        const { pathname } = window.location;

        this.IS_MODEL_PAGE = pathname.startsWith('/model/');
        this.IS_VIDEO_PAGE = pathname.startsWith('/view_video.php');
        this.IS_PLAYLIST_PAGE = pathname.startsWith('/playlist/');

        this.paginationElement = document.querySelector('.paginationGated');

        this.paginationLast = parseInt(document.querySelector('.page_next')?.previousElementSibling.innerText) || 1;
        if (this.paginationLast === 10) this.paginationLast = 999;

        this.paginationOffset = parseInt(new URLSearchParams(location.search).get('page')) || 1;

        this.CONTAINER = document.querySelector('ul.videos.row-5-thumbs, ul.videos.nf-videos, ul#singleFeedSection, ul#videoSearchResult, ul#singleFeedSection');

        this.intersectionObservable = this.CONTAINER && findNextSibling(this.CONTAINER);
    }

    THUMB_URL(thumb) {
        return thumb.querySelector('.linkVideoThumb').href;
    }

    GET_THUMBS(html) {
        const parent = html.querySelector(this.IS_MODEL_PAGE ? '.videos.row-5-thumbs' : 'ul.videos.nf-videos') || html;
        return parent.querySelectorAll('li.videoBox.videoblock, li.videoblock');
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('.js-videoThumb.thumb.js-videoPreview');
        const imgSrc = img?.getAttribute('data-mediumthumb') || img?.getAttribute('data-path').replace('{index}', '1');
        if (!img?.complete || img.naturalWidth === 0) { return ({}); }
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
      return UNIVERSAL_RULES.parseThumbData(thumb);
    }

    paginationUrlGenerator = (n) => {
      const url = new URL(window.location.href);
      url.searchParams.set('page', n);
      return url.href;
    }
}

const RULES = new PORNHUB_RULES();

//====================================================================================================

function route() {
  if (RULES.IS_VIDEO_PAGE) {
      const containers = getAllUniqueParents(document.querySelectorAll('li.pcVideoListItem.js-pop.videoBox')).slice(2);
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

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
