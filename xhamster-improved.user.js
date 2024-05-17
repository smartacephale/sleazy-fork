// ==UserScript==
// @name         XHamster Improved
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      2.0.2
// @description  Infinite scroll. Filter by duration, include/exclude phrases. Automatically expand more videos on video page.
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xhamster.com/*
// @match        https://*.xhamster.desi/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xhamster.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1378559
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.meta.js
// ==/UserScript==
/* globals jQuery, $, Vue, createApp, watch, reactive, getAllUniqueParents, watchElementChildrenCount,
 timeToSeconds, parseDOM, parseIntegerOr, fetchHtml, stringToWords, Observer, DefaultState,
 LazyImgLoader, PersistentState, DataManager, PaginationManager, VueUI */

const LOGO = `
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⡘⢲⣃⢖⡚⡴⢣⡞⠰⠁⡀⠀⠀⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢮⡵⣫⣝⡳⠏⢠⢃⡐⠁⡘⢀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⡀⠀⡀⠀⠀⠀⠀⢀⠐⡀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠔⡉⢃⡉⠓⡈⢃⠊⡐⠡⡐⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠠⠐⠀⠄⠐⠀⡐⠀⠠⠁⡀⢁⠀⠂⠄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠂⡔⢢⡐⢣⡜⢤⠣⡜⡰⢀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⠠⠐⠀⠠⠐⡈⠄⡈⠐⡀⠌⢀⠐⠀⠄⡈⢂⠔⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠀⠦⡙⣌⠣⡜⢣⡚⡥⣛⠴⣡⠃⠆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠐⠈⢀⠐⠈⡐⠠⠐⠠⢀⠡⠐⡀⠂⠌⡐⠠⢐⠡⢈⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡄⠈⡐⠠⣉⠖⡱⢌⠳⣌⢣⡑⠦⠡⢏⡴⣉⠂⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠈⠀⠐⠀⠠⢁⠀⢂⠁⠂⠄⠂⡁⠄⢁⠂⠄⡁⢢⠘⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⠈⠆⢀⠰⣀⠣⢔⡩⢜⢪⡱⢂⠇⡌⢣⠁⡞⣰⠡⢂⠀⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠁⠂⠈⠀⠀⠈⡀⠌⠐⠈⠐⠀⠈⠄⢀⠂⠐⡀⢊⠡⠀⠀⠀⠀⠀⠀⠀⠀⠠⡈⢆⡹⠀⢂⢅⠢⣍⠒⡜⣬⠣⣕⠫⡜⢠⠃⢰⠩⡖⡑⢂⠀⡀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⢀⠀⠈⠀⠄⠀⠄⠂⢀⠈⠀⠀⠀⠀⠁⡀⠣⢘⠀⠀⠀⠀⠀⠀⠀⠄⡑⠌⢢⠐⡡⢌⡊⠵⡨⠝⢲⡤⡛⣌⠳⣈⠆⠡⢈⠳⣌⡑⢂⠠⠀⠂⠀⢀⠀⠀⢄⡀⡠⠀⠄⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⡀⠀⢈⠀⠂⠁⡀⠠⠀⡀⢈⢄⡒⡔⣢⢔⢣⢆⢆⠤⣠⢀⡀⣀⠬⣰⠜⣎⢧⢯⡵⣫⣜⣳⣙⣎⢧⡒⡥⢌⡱⢀⠂⠁⢈⠱⡰⢌⠂⠤⢑⡈⢅⠢⢌⡑⢆⠱⣡⠋⡔⠀⠀
 ⠀⠀⠀⠀⠀⠀⠀⢀⠐⠀⢀⠂⢀⠀⡄⢒⡌⠶⣘⠶⣙⢦⣛⢮⡞⣎⡗⣦⠓⡴⣡⢟⣵⡻⣽⡞⣷⢯⣗⣻⢶⣫⡞⣶⡹⣜⣣⢖⡡⢆⡀⢀⠃⠖⡨⠐⣈⠦⡘⢤⠣⠜⡌⣌⠢⢱⡘⠄⠐⠈
 ⠀⠀⠀⠀⠀⠀⠈⠀⠀⠐⠀⢀⠢⣘⠰⣃⠞⣵⢫⡟⣽⣺⢽⣮⡝⡾⡼⣉⢾⣱⢯⣟⡾⣽⣳⢿⣽⣻⢾⣽⣳⢯⣽⣳⢯⣳⢳⣎⡗⢮⡐⢆⡉⢒⠡⠀⢖⡰⢉⢆⠣⣍⠲⣀⠣⣁⠎⠄⠀⢀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢆⡱⢌⡳⢭⡞⣭⢷⣻⢷⣯⣟⡾⣽⣳⡱⣝⡮⣟⣽⢾⣻⣽⣟⣯⣷⣿⣻⣾⣽⣻⡾⣽⢯⣟⡷⣞⡽⢮⣝⠲⣌⠢⢁⠂⠥⢊⡕⣊⠱⣂⠓⡄⠣⡔⡈⠀⠀⢀
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣍⠲⣘⢮⡱⣏⡾⣽⢯⣟⣿⣾⡽⣿⡳⢧⡳⣝⡾⣽⢯⣿⣟⣯⣿⣿⣻⣾⣟⣷⣿⢯⣿⢯⣿⢾⣽⣻⣞⡷⣎⢿⡰⣃⠆⡈⢰⢣⡘⢤⠓⣌⢣⠐⡡⢒⠀⠁⠀⢈
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⡘⠤⣃⠳⣎⣳⣭⢿⣽⣻⡾⣿⣟⣿⢻⣝⡣⡝⣮⢿⣽⣻⣯⣿⣿⣿⣿⣿⣿⣿⣿⣻⣿⢿⣻⣯⣿⣞⣷⣻⣼⣛⡮⣵⢣⡚⢄⠘⢆⡙⢦⡙⢤⠃⢎⠡⠆⡌⠀⠀⠠
 ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡴⣉⠗⣎⢷⣚⡿⣞⣷⣻⢷⡯⣝⠳⣪⠵⡹⣜⣻⢾⣽⣻⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⣟⣷⡿⣾⣳⣟⣞⣳⡽⣲⢣⡝⢢⠌⡠⢈⠂⠝⣢⠹⣌⠱⢌⠄⠀⠁⠀
 ⢣⠜⡄⢦⢀⠤⢂⠔⠀⠑⡰⢡⡛⣬⢳⢯⡽⣻⡼⢯⣳⠽⡌⢯⡔⣫⢷⡸⣝⠿⣞⡿⣯⣿⣿⡿⣿⣿⢿⣿⣽⣷⣿⣿⣻⣽⡷⣟⡾⣝⣧⢻⡱⢇⡞⡡⢎⠔⡡⢌⡐⠠⠑⠌⡱⢈⠤⠈⠄⣀
 ⣂⠎⡰⢢⠍⢆⠃⢠⢩⡔⣮⠱⡸⣌⢗⣫⢞⡵⣻⢏⡧⣏⡽⣌⠲⣭⢖⡧⣫⢟⡽⣻⡽⣷⣻⢿⣻⣽⡿⣯⣿⢯⣷⣿⣻⣽⣻⣽⣛⠷⣎⠷⣙⠮⣜⡱⣊⡜⣡⠒⣌⠱⠈⠄⠡⢂⠒⡌⢰⠀
 ⢍⡶⣙⢦⡙⢆⠈⣴⢣⡿⣜⡷⣥⠊⢞⡰⢫⡜⣣⠏⠶⣡⢛⡼⣛⠶⡹⢶⡙⣎⠷⣹⣝⣳⢯⣟⣯⢷⣻⢯⣟⡿⣽⣞⣯⢷⡻⢮⡹⡹⣌⠯⣕⡫⢖⣱⢱⡘⠤⠋⣄⢢⢡⠊⡔⣈⠱⡌⢃⠜
 ⡟⡴⣋⠶⣙⡎⢲⣭⢿⣽⢻⡼⣣⠙⠢⣅⠣⣜⠰⣉⠖⡡⢉⠖⡥⢋⡓⢧⡙⢦⡙⠰⢪⠕⣏⠾⣜⠯⣝⢯⡞⣽⢣⠟⣬⣳⣟⣿⣳⢷⡩⢞⡱⣭⢋⡖⠣⡌⣥⢫⡔⣣⢎⡱⠒⡄⢆⠘⡂⠥
 ⢿⣱⣏⡖⣣⠜⣱⢮⡷⣫⣟⡵⡃⢀⡁⠆⠓⡌⠳⠌⢎⠡⠃⠎⠐⢩⢌⣃⠹⣂⠡⠓⠤⢊⠜⡸⢌⡳⣍⠶⣙⢦⡛⣞⣳⣟⡾⣷⣟⣧⢻⣭⣓⡌⢧⡜⢧⡹⣆⡳⣙⢦⢋⠴⡉⠔⡈⢰⡉⢇
 ⢯⠷⣞⣳⢬⠸⣭⢷⡻⣵⢺⡝⣁⢾⡸⣝⢶⡲⣕⠶⣎⢷⣫⢞⡽⡬⣤⢌⣣⣘⢤⡥⣆⡖⡤⣥⣀⡑⠨⠚⠥⢎⢵⣫⢷⣯⣿⣟⣾⡭⢷⣞⣧⡻⣥⢛⢧⣛⡴⢣⡍⢦⡉⢆⢁⣂⢠⢃⡜⢤
 ⣳⢻⡜⣣⢎⡱⣏⢾⡳⣭⢷⡚⢬⡷⣻⡼⣧⣟⢮⣟⢮⣳⣝⡮⢷⡽⢮⣟⡶⣭⢷⣻⡼⣝⣳⡵⣫⢽⡻⢶⣞⣤⠸⣝⣯⡷⣿⣻⢾⣽⣻⡾⣽⣳⢎⡝⡎⠶⣩⠇⣜⡰⡜⣸⠲⡌⣆⠣⡜⢢
 ⡷⣋⠾⣥⢫⡴⢫⢧⡛⣭⠾⡽⣣⠻⣵⢻⡵⣞⣟⡾⣏⡷⡾⣽⣛⣾⢻⣼⢻⣭⢷⣳⢟⣭⢷⡻⣝⣾⡹⢷⣎⢯⣽⣻⣞⣿⣳⢯⣟⡾⣣⣟⣷⡻⢎⡰⣉⠳⣤⢛⠴⡣⣕⢣⠣⡝⢤⠓⣍⠆
 ⣭⠳⣙⠶⡩⢎⠅⡻⣜⢦⣋⠷⣩⠗⣎⢯⣽⢫⡾⡽⣽⣹⢟⣵⡻⢮⡟⣾⣹⢮⡟⣽⠾⣭⡟⣽⣫⢶⡛⢯⡴⣻⣞⡷⣯⢷⢫⢟⣼⣳⢓⡾⡱⡝⣢⠕⣎⡳⢬⣋⢞⡱⡜⢪⡕⡜⢢⡙⢤⡉
 ⢦⡙⡜⢢⠓⣌⢚⡱⣌⠳⣎⠳⣍⡛⣜⡘⡮⢏⡷⣻⢵⣫⢟⡼⣹⠯⣝⢶⢫⡗⣯⠝⢯⠳⡝⢣⢍⠲⣙⠮⡵⣛⡼⡹⢎⢇⡫⡞⡵⣃⠷⣜⢣⡝⢦⡛⡴⡙⢦⡉⢦⠓⣌⠣⠜⡨⢅⡘⠤⣈
 ⢆⠰⢈⠆⠱⣀⠣⢒⠌⡓⡌⠳⢄⠹⢤⠓⡘⢭⠲⡱⢎⠶⣩⠚⡥⢛⡌⢎⡱⠚⣄⢋⠆⡣⢉⠖⡨⠣⢍⠚⠥⢓⠬⡑⢎⠲⠱⣙⠲⣉⠞⣌⠣⢎⡱⢜⠲⣉⠦⡙⢦⡙⠤⢓⡘⣐⠢⢌⡐⢀
 ⢀⠂⠡⢈⠐⠠⠑⣈⠢⠑⡈⢁⠊⡐⠂⠉⠜⡀⠣⠑⠊⠆⡅⢋⠔⠡⠘⠠⠂⠑⠀⡈⠀⠁⡀⢀⠀⢁⠀⠌⠠⢁⠂⠡⢈⠰⠁⢂⠡⠐⠈⠄⡉⢂⠱⢈⠱⢈⠒⠩⡐⠌⡑⠌⠰⢀⠃⠂⠄⢃
 ⢀⠈⠄⠂⠈⠄⠡⠀⠄⠁⡀⠂⠀⠀⠀⠀⠀⠀⠁⠈⡐⠠⠀⠂⠐⠠⠀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⠀⠂⠐⠠⠈⠐⢀⠂⠐⠈⡐⠀⡈⠐⠈⠀`;

function expandMoreVideoPage() {
    const getExpandButton = () => document.querySelector('button[data-role="show-more-next"]');
    const observer = new Observer((target) => {
        target.click();
    });
    observer.observe(getExpandButton());
}

//====================================================================================================

function createPreviewVideoElement(src, mount) {
    const video = document.createElement('video');
    video.playsinline = true;
    video.webkitplaysinline = true;
    video.autoplay = true;
    video.loop = true;
    video.classList.add('thumb-image-container__video');
    video.src = src;
    video.addEventListener('loadeddata', () => {
        mount.before(video);
    }, false);
    return {
        video,
        removeVideo: () => {
            video.removeAttribute('src');
            video.load();
            video.remove();
        }
    };
}

function handleThumbHover(e) {
    if (!e.target.classList.contains('thumb-image-container__image')) return;
    const videoSrc = e.target.parentElement.getAttribute('data-previewvideo');
    const { video, removeVideo } = createPreviewVideoElement(videoSrc, e.target);
    e.target.parentElement.parentElement.addEventListener('mouseleave', removeVideo, { once: true });
}

function animate() {
    document.body.addEventListener('mouseover', handleThumbHover);
}

animate();

//====================================================================================================

class XHAMSTER_RULES {
    constructor() {
        this.IS_VIDEO_PAGE = /^\/videos\//.test(window.location.pathname);

        this.PAGINATION = document.querySelector('.prev-next-list, .test-pager');
        this.PAGINATION_LAST = parseInt(document.querySelector('.page-limit-button')?.innerText ||
                                        Array.from(document.querySelectorAll('.page-button-link')).pop()?.innerText ||
                                        document.querySelector('.test-pager')?.lastElementChild.previousElementSibling.innerText);
        this.CONTAINER = Array.from(document.querySelectorAll('.thumb-list')).pop();
    }

    GET_THUMBS(html) {
        return html.querySelectorAll('.thumb-list__item:not([data-video-type])');
    }

    THUMB_URL(thumb) {
        return thumb.firstElementChild.href;
    }

    THUMB_IMG_DATA(thumb) {
        if (stateLocale.pagIndexCur === 1) return ({});
        const img = thumb.querySelector('img[loading]');
        if (img) img.removeAttribute('loading');
        if (!img?.complete || img.naturalWidth === 0) return ({});
        return { img, imgSrc: img.src }
    }

    THUMB_DATA(thumb) {
        const title = thumb.querySelector('.video-thumb-info__name').innerText.toLowerCase();
        const duration = timeToSeconds(thumb.querySelector('.thumb-image-container__duration').innerText);
        return {
            title,
            duration,
        };
    }

    URL_DATA() {
        const { origin, pathname, href } = window.location;

        let offset = 1;
        let iteratable_url = () => "";

        if (/^\/search\//.test(pathname)) {
            const url = new URL(href);
            offset = url.searchParams.get('page') || 1;
            iteratable_url = n => {
                url.searchParams.set('page', n);
                return url.href;
            };
        } else {
            const mres = location.pathname.split(/\/(\d+)$/);
            const base = mres[0];
            if (mres[1]) offset = parseInt(mres[1]);
            iteratable_url = n => `${origin}${base}/${n}`;
        }

        return {
            offset,
            iteratable_url
        }
    }
}

const RULES = new XHAMSTER_RULES();

//====================================================================================================

function parseInPLace() {
    const containers = getAllUniqueParents(RULES.GET_THUMBS(document.body));
    containers.forEach(c => handleLoadedHTML(c, c));
}

function route() {
    if (RULES.IS_VIDEO_PAGE) {
        expandMoreVideoPage();
        watchElementChildrenCount(RULES.CONTAINER, (_, count) => {
            setTimeout(parseInPLace, 1800);
        });
    }

    if (RULES.PAGINATION) {
        const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    }

    parseInPLace();

    const ui = new VueUI(state, stateLocale);
}

//====================================================================================================

const SCROLL_RESET_DELAY = 350;

console.log(LOGO);

const defaultState = new DefaultState();
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

route();
