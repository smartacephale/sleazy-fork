// ==UserScript==
// @name         XHamster Improved
// @namespace    http://tampermonkey.net/
// @version      3.1.0
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases. Automatically expand more videos on video page.
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xhamster.*/*
// @match        https://*.xhamster.com/*
// @exclude      https://*.xhamster.com/embed*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xhamster.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.4.2/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493935/XHamster%20Improved.meta.js
// ==/UserScript==

const { getAllUniqueParents, watchElementChildrenCount, waitForElementExists, timeToSeconds, exterminateVideo, Observer, sanitizeStr, DataManager, createInfiniteScroller } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDurationAndPrivacy, JabroniOutfitUI, defaultSchemeWithPrivacyFilter } = window.jabronioutfit;

if (window.top != window.self) return;

if (!/^(\w{2}.)?xhamster.(com|desi)/.test(window.location.host)) throw new Error('whatever');

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
    delay = 300;

    constructor() {
        this.IS_VIDEO_PAGE = /^\/videos|moments\//.test(window.location.pathname);
        this.paginationElement = document.querySelector('.prev-next-list, .test-pager');
        this.paginationLast = parseInt(Array.from(
            (this.paginationElement || document).querySelectorAll('.page-button-link, .xh-paginator-button')).pop()?.innerText.replace(/\,/g, ''));
        Object.assign(this, this.URL_DATA());
        this.CONTAINER = [...document.querySelectorAll('.thumb-list')].pop();
    }

    IS_PRIVATE(thumb) {
      return !!thumb.querySelector('[data-role="video-watched');
    }

    GET_THUMBS(html) {
        return html.querySelectorAll('.video-thumb');
    }

    THUMB_URL(thumb) {
        return thumb.firstElementChild.href;
    }

    THUMB_IMG_DATA(thumb) {
        if (store?.localState.pagIndexCur === 1) return ({});
        const img = thumb.querySelector('img[loading]');
        if (img) img.removeAttribute('loading');
        if (!img?.complete || img.naturalWidth === 0) return ({});
        return { img, imgSrc: img.src }
    }

    THUMB_DATA(thumb) {
        const title = sanitizeStr(thumb.querySelector('.video-thumb-info__name,.video-thumb-info>a')?.innerText);
        const duration = timeToSeconds(thumb.querySelector('.thumb-image-container__duration')?.innerText);
        return { title, duration }
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const paginationOffset = parseInt(url.searchParams.get('page') || url.pathname.match(/\/(\d+)\/?$/)?.pop()) || 1;

        const paginationUrlGenerator = n => {
            if (/^\/search\//.test(url.pathname)) {
                url.searchParams.set('page', n);
            } else {
                if (!/\/\d+\/?$/.test(url.pathname)) url.pathname = `${url.pathname}/${paginationOffset}/`;
                url.pathname = url.pathname.replace(/\/\d+\/?$/, `/${n}/`);
            }
            return url.href;
        }

        return { paginationOffset, paginationUrlGenerator }
    }
}

const RULES = new XHAMSTER_RULES();

//====================================================================================================

function expandMoreVideoPage() {
    waitForElementExists(document.body, 'button[data-role="show-more-next"]', (el) => {
        const observer = new Observer((target) => target.click());
        observer.observe(el);
    });
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
    const stop = () => exterminateVideo(video);
    return { stop };
}

function handleThumbHover(e) {
    if (!e.target.classList.contains('thumb-image-container__image')) return;
    const videoSrc = e.target.parentElement.getAttribute('data-previewvideo');
    const { stop } = createPreviewVideoElement(videoSrc, e.target);
    e.target.parentElement.parentElement.addEventListener('mouseleave', stop, { once: true });
}

function animate() {
    document.body.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function parseInPLace() {
    const containers = getAllUniqueParents(RULES.GET_THUMBS(document.body));
    containers.forEach(c => parseData(c, c, false, false));
}

function route() {
    animate();

    if (RULES.IS_VIDEO_PAGE) {
        expandMoreVideoPage();
        watchElementChildrenCount(RULES.CONTAINER, () => setTimeout(parseInPLace, 1800));
    }

    if (RULES.paginationElement) {
      createInfiniteScroller(store, parseData, RULES);
    }

    parseInPLace();
    setTimeout(parseInPLace, 500);

    new JabroniOutfitUI(store, defaultSchemeWithPrivacyFilter);
}


defaultSchemeWithPrivacyFilter.privacyFilter = [
  { type: "checkbox", model: "state.filterPrivate", label: "unwatched" },
  { type: "checkbox", model: "state.filterPublic", label: "watched" }];

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);
route();
