// ==UserScript==
// @name         XHamster Improved
// @namespace    http://tampermonkey.net/
// @version      2.42
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases. Automatically expand more videos on video page
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xhamster.com/*
// @match        https://*.xhamster.desi/*
// @exclude      https://xhamster.com/embed/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xhamster.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://unpkg.com/billy-herrington-utils@1.1.1/dist/billy-herrington-utils.umd.js
// @require      https://unpkg.com/jabroni-outfit@1.4.7/dist/jabroni-outfit.umd.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1428433
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.meta.js
// ==/UserScript==
/* globals $ DataManager PaginationManager */

const { Tick, findNextSibling, parseDom, fetchWith, fetchHtml, fetchText, SyncPull, wait, computeAsyncOneAtTime, timeToSeconds,
    parseIntegerOr, stringToWords, parseCSSUrl, circularShift, range, listenEvents, Observer, LazyImgLoader,
    watchElementChildrenCount, watchDomChangesWithThrottle, copyAttributes, replaceElementTag, isMob,
    objectToFormData, parseDataParams, sanitizeStr, chunks, getAllUniqueParents
} = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

if (!/^(\w{2}.)?xhamster.(com|desi)/.test(window.location.host)) return;

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

class XHAMSTER_RULES {
    constructor() {
        this.IS_VIDEO_PAGE = /^\/videos|moments\//.test(window.location.pathname);
        this.PAGINATION = document.querySelector('.prev-next-list, .test-pager');
        this.PAGINATION_LAST = parseInt(Array.from(
            (this.PAGINATION || document).querySelectorAll('.page-button-link, .xh-paginator-button')).pop()?.innerText.replace(/\,/g, ''));
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
        const title = sanitizeStr(thumb.querySelector('.video-thumb-info__name').innerText);
        const duration = timeToSeconds(thumb.querySelector('.thumb-image-container__duration').innerText);
        return { title, duration }
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const offset = parseInt(url.searchParams.get('page') || url.pathname.match(/\/(\d+)\/?$/)?.pop()) || 1;
        if (!/\/\d+\/?$/.test(url.pathname)) url.pathname = `${url.pathname}/${offset}/`;

        const iteratable_url = n => {
            if (/^\/search\//.test(url.pathname)) {
                url.searchParams.set('page', n);
            } else {
                url.pathname = url.pathname.replace(/\/\d+\/?$/, `/${n}/`);
            }
            return url.href;
        }

        return { offset, iteratable_url }
    }
}

const RULES = new XHAMSTER_RULES();

//====================================================================================================

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

//====================================================================================================

function parseInPLace() {
    const containers = getAllUniqueParents(RULES.GET_THUMBS(document.body));
    containers.forEach(c => handleLoadedHTML(c, c, false, false));
}

function route() {
    animate();

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
    new JabroniOutfitUI(store);
}

//====================================================================================================

const SCROLL_RESET_DELAY = 350;

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(filter_);

console.log(LOGO);
route();
