// ==UserScript==
// @name         PornHub Improved
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.6
// @description  Infinite scroll (optional). Lazy loading. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.pornhub.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pornhub.com
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494001/PornHub%20Improved.meta.js
// ==/UserScript==
/* globals jQuery, $, Vue, createApp, watch, reactive, findNextSibling, watchElementChildrenCount,
 timeToSeconds, parseDOM, parseIntegerOr, fetchHtml, stringToWords, Observer, getAllUniqueParents,
 LazyImgLoader, PersistentState, DataManager, PaginationManager, VueUI, DefaultState */

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
    constructor() {
        const { pathname } = window.location;

        this.IS_MODEL_PAGE = pathname.startsWith('/model/');
        this.IS_VIDEO_PAGE = pathname.startsWith('/view_video.php');
        this.IS_PLAYLIST_PAGE = pathname.startsWith('/playlist/');

        this.PAGINATION = document.querySelector('.paginationGated');
        this.PAGINATION_LAST = parseInt(document.querySelector('.page_next')?.previousElementSibling.innerText) || 1;

        this.CONTAINER = document.querySelector('ul.videos.row-5-thumbs, ul.videos.nf-videos, ul#singleFeedSection, ul#videoSearchResult, ul#singleFeedSection');

        this.INTERSECTION_OBSERVABLE = this.CONTAINER && findNextSibling(this.CONTAINER);
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
        if (!img?.complete || img.naturalWidth === 0) { return ({});}
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const title = thumb.querySelector('span.title').innerText.toLowerCase();
        const duration = timeToSeconds(thumb.querySelector('.duration').innerText);
        return {
            title,
            duration,
        };
    }

    URL_DATA() {
        const { origin, pathname, href } = window.location;
        const url = new URL(window.location.href);
        const offset = parseInt(url.searchParams.get('page')) || 1;
        const iteratable_url = n => {
            url.searchParams.set('page', n);
            return url.href;
        }
        return {
            offset,
            iteratable_url
        }
    }
}

const RULES = new PORNHUB_RULES();

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const defaultState = new DefaultState();
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

if (RULES.IS_VIDEO_PAGE) {
    const containers = getAllUniqueParents(document.querySelectorAll('li.pcVideoListItem.js-pop.videoBox')).slice(2,);
    containers.forEach(c => handleLoadedHTML(c, c));
}

if (RULES.CONTAINER) {
    handleLoadedHTML(RULES.CONTAINER);
}

if (RULES.IS_PLAYLIST_PAGE) {
    handleLoadedHTML(RULES.CONTAINER);
    watchElementChildrenCount(RULES.CONTAINER, () => {
        handleLoadedHTML(RULES.CONTAINER);
    });
}

if (RULES.PAGINATION) {
    const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
}

const ui = new VueUI(state, stateLocale);
