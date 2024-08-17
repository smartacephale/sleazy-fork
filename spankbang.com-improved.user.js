// ==UserScript==
// @name         SpankBang.com Improved
// @namespace    http://tampermonkey.net/
// @version      1.81
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.spankbang.com/*
// @grant        GM_addStyle
// @require      https://unpkg.com/billy-herrington-utils@1.0.3/dist/billy-herrington-utils.umd.js
// @require      https://unpkg.com/jabroni-outfit@1.4.1/dist/jabroni-outfit.umd.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1428433
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spankbang.com
// @downloadURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.meta.js
// ==/UserScript==
/* globals $ DataManager PaginationManager */

const { Tick, findNextSibling, parseDom, fetchWith, fetchHtml, fetchText, SyncPull, wait, computeAsyncOneAtTime, timeToSeconds,
    parseIntegerOr, stringToWords, parseCSSUrl, circularShift, range, listenEvents, Observer, LazyImgLoader,
    watchElementChildrenCount, watchDomChangesWithThrottle, copyAttributes, replaceElementTag, isMob,
    objectToFormData, parseDataParams, sanitizeStr, chunks, getAllUniqueParents
} = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

const LOGO = `
⡕⡧⡳⡽⣿⣇⠀⢀⠀⠄⠐⡐⠌⡂⡂⠠⠀⠠⠀⠠⠀⠠⡐⡆⡇⣇⢎⢆⠆⠌⢯⡷⡥⡂⡐⠨⣻⣳⢽⢝⣵⡫⣗⢯⣺⢵⢹⡪⡳⣝⢮⡳⣿⣿⣿⣿⣿⣿⣿⣿
⢎⢞⡜⣞⣿⡯⡆⠀⠄⠐⠀⢐⠡⢊⢐⢀⠈⠀⠄⠁⡀⠡⠸⡸⡪⣪⢺⢸⢱⠡⢑⡝⣟⣧⡂⠅⠪⣻⣎⢯⡺⣪⣗⢯⣺⢪⡣⡯⣝⢼⡪⣞⣽⣿⣿⣿⣿⣿⣿⣿
⡱⡣⣣⢳⣻⣯⢿⡐⠀⠂⠁⢀⠪⢐⠐⠄⡀⠁⠄⠁⠀⠄⡑⠆⡎⢎⢎⢇⢕⠬⠀⢇⢣⢻⣞⠌⠌⡪⣷⡱⣝⢮⣺⢕⡗⣕⢧⢳⢕⢗⣝⢞⣾⣿⣿⣿⣿⣿⣿⣻
⡸⡪⣪⡚⣞⣯⡗⣝⡀⠄⠁⡀⠌⡂⠅⡁⠄⠂⠐⠈⠀⢂⢐⢔⢜⢜⢜⢜⢔⢬⢊⠠⠨⠨⣻⣽⢐⠨⡺⣞⢼⢕⣗⡽⣪⢺⢜⢵⡹⣕⢵⡫⣾⣿⣿⣿⣿⣿⢯⣟
⢎⢇⢇⢧⡫⣿⡞⡜⡄⠀⠄⠀⠐⠄⡁⠀⠄⠐⠀⠂⢁⢐⢔⢕⢕⠱⢱⠱⡱⡱⡱⡅⡂⢁⠪⡿⣎⡢⡘⢽⡪⡧⣳⡝⣜⢎⢗⢇⢯⡪⡧⣻⡺⣿⣿⣿⣿⢯⡻⡮
⢕⢝⢜⡜⡮⣻⣗⢕⠅⡀⠂⠈⢈⠐⠀⠁⢀⠐⠀⡁⠄⢊⢢⢣⢣⢣⢣⢣⢣⢫⢪⢪⠀⠄⠨⡚⣿⣳⡜⡘⣗⢽⡺⡪⡺⡸⡵⡹⡕⡧⣫⡺⡺⣿⣿⡿⡯⡯⣫⢯
⢸⢱⢱⢱⢕⢯⣿⢜⠌⢀⠀⠂⠀⠂⠁⠈⠀⠀⠄⠀⠄⢑⠌⡆⢇⢅⠕⡌⡬⡪⡪⡪⠀⠄⢁⠸⡸⣯⡻⣪⢺⡵⡫⡪⣣⢫⡪⡣⡏⣞⢜⢮⣫⣻⡿⣫⢯⢞⣗⢽
⢪⢪⢪⢪⢎⢞⢾⡇⢕⠄⡆⡪⡘⡔⢔⢀⠐⠀⢀⠁⠠⠀⠑⠜⡌⡖⡕⡕⡕⢕⠑⠀⠠⠐⠀⡀⠕⡳⣻⣜⣕⣯⢣⠣⡣⡣⡣⡫⡪⡪⣎⢧⣧⡳⣝⢮⡳⡽⣜⢵
⡸⡸⡸⡸⡸⡱⣫⢯⣲⢱⢱⢘⢜⢜⢕⢕⢅⣂⠀⡀⠐⠀⡁⢐⠨⢐⠡⡊⢌⠂⠄⠂⠀⠂⡠⡠⡢⡫⡳⡱⡝⡮⡪⣇⢧⢳⢕⣝⢮⡫⡮⡳⣕⢵⣓⢗⡝⡮⡺⡜
⠱⡑⡕⡕⡝⡜⣎⢿⣪⢗⡝⡜⡜⡜⡜⢜⢕⢎⢎⢆⢎⢔⢄⠢⡌⢆⢕⠨⡢⢱⢰⢸⢸⣜⢮⢎⢎⢎⢇⢇⢯⢪⢇⡗⣝⢮⢳⢕⡗⣝⢮⡫⡮⣣⡳⡕⣝⢼⢸⢸
⢜⢸⢨⢪⢪⢪⢪⣻⣺⢯⢎⣇⢧⢧⢧⢧⢯⢾⡵⣯⢾⣼⣜⣜⢜⢜⢜⢜⢜⢜⡜⡮⣗⡯⣟⣎⢎⢆⢇⢕⢕⢇⢗⡝⣜⢮⣳⣟⣾⣷⣷⣿⣮⣎⢎⢎⢎⢎⢎⠎
⠣⡑⢌⠎⡜⢜⢜⢜⢜⡕⣧⡳⣫⢏⡯⡯⡯⡯⣯⢯⣟⢷⣻⣟⣿⢷⣷⣳⡽⡮⡾⣝⡎⡏⡎⡇⡕⡜⡔⡕⡕⣝⢜⢮⡳⡽⣺⢽⣻⢿⢿⣟⣿⣺⣝⢮⡢⡧⣧⡠
⠐⠨⢢⢑⢅⢣⢱⢜⢞⢮⡳⣝⢮⣻⣪⢯⢯⡻⣺⢝⡾⣝⢷⢽⣺⢯⢿⢽⣻⣮⡳⣕⢇⢇⢇⢇⠪⡪⡪⡪⡪⣎⢯⢳⣹⡪⡯⣫⢯⣻⢽⣳⣳⣳⢳⣝⢮⡫⡷⣷
⠀⠨⡂⡅⡖⡵⡹⣕⢏⡧⢯⢮⡳⣣⢷⢽⢕⣯⡳⣏⡯⣞⡽⣳⢽⢽⢽⣝⣗⣗⣟⢮⢳⡱⡱⡱⡑⡕⡜⢜⢜⡜⣎⢧⡣⡯⡺⣝⡵⡯⡯⣞⣞⢮⣳⡳⣝⣞⡽⣺
⠀⠰⡸⡸⣸⢪⡫⣎⢗⢽⢕⣗⢽⣕⢯⣳⡫⣞⢮⣳⢽⣪⢯⢞⡽⣺⢵⣳⣳⡳⣳⢝⢵⡹⡪⣎⢎⢆⢇⢇⢇⢗⡕⡧⡳⣝⡝⡮⣞⡽⡽⡵⣳⣫⢞⡮⣗⣗⢽⣳
⠀⠨⢢⢣⢳⡱⣝⢼⢭⢳⢳⢕⣗⢗⡽⣪⢞⡽⣕⢷⢝⡮⣏⡯⣞⣗⢽⡺⡼⣺⢵⡫⡧⣳⢹⢜⡜⡜⡜⢜⢪⢣⡫⣎⢯⡪⣞⣝⢞⢮⢏⡯⣳⣳⣫⢾⢕⣗⢯⣞
⠀⠀⠱⡱⡱⡕⡧⡳⡕⣏⢗⣝⢮⢳⢝⢮⡳⣝⢮⡳⣝⢮⡳⣝⢮⡺⡵⣫⢯⡳⣳⢝⣞⡜⣎⢇⢎⠎⡪⢊⠎⡎⡎⡮⡺⣜⢮⢮⣫⣫⡳⡽⣕⣗⢵⣫⢯⡺⡵⣳
⠀⠀⠈⢎⢎⠮⡺⡸⡕⡧⡳⣕⢝⢮⡫⣣⢯⣪⢳⢝⢮⢳⢝⢮⡳⣝⣝⢮⡳⣝⢮⡳⡵⣝⢼⢸⢐⠅⠂⡐⢅⢇⢣⢣⢳⡱⣝⠮⡮⣪⢞⣝⢮⡺⣕⢗⣗⢽⡹⣪
⠀⠈⠀⠌⡒⡝⡜⣕⢕⢧⢫⡪⡳⡱⣝⢜⢮⡪⣳⢹⡪⣳⢹⢕⢽⡸⣜⢵⢝⢮⢳⢝⢞⢮⡪⡣⡣⡑⢅⢢⠱⡘⡜⡜⣜⢜⠮⡝⡮⡪⡧⡳⡵⣹⡪⡳⡕⡗⣝⢮
⠀⠐⠀⡁⠌⢎⢎⢎⢮⢪⢎⢮⢪⢳⢱⢝⢜⢎⢮⢣⡫⡪⡎⣗⢕⢧⢳⡱⡝⣎⢗⣝⢕⡗⣝⢼⢸⢨⢢⢃⢇⢣⢣⢣⢣⢳⢹⢪⢎⢗⢝⡜⣎⢮⢪⡳⡹⣪⢺⢸
⠀⠠⠐⢀⠐⠈⡎⡪⡪⡪⡪⡪⡣⡫⡪⡪⡣⡫⡪⡣⡣⡫⣪⢪⢺⢸⢪⢪⢺⢸⢪⡪⡺⡸⣪⢪⢪⢪⠸⡨⡊⡎⡎⡎⡇⡏⡎⡞⡜⡕⣕⢕⢕⡕⡇⡧⡫⡪⡪⡪
⢀⠀⠐⠀⠄⠁⠨⡊⡎⡎⡎⡎⡎⡎⡎⡎⡇⡏⡎⡎⡎⡎⡎⡎⡎⡮⡪⡣⡳⡱⡱⡕⡝⣜⢜⢜⢜⢔⢕⢱⠸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡸⡨⡣⡣⡣⡣⡣⡣⡃⡇
⠀⠀⠈⡀⠂⠐⠀⢑⠜⡌⢎⢪⠪⡪⡪⡪⢪⠪⡪⢪⠪⡪⡪⢪⠪⡊⡎⡜⡌⡎⢎⢎⢎⢎⠎⡎⡪⠢⡑⢌⢪⢘⢔⠱⡡⢣⢃⢇⠕⡕⢅⢇⢣⢱⢑⢕⠸⡐⡱⡘`;


class SPANKBANG_RULES {
    constructor() {
        this.PAGINATION = document.querySelector('.paginate-bar, .pagination');
        this.PAGINATION_LAST = parseInt(
            document.querySelector('.paginate-bar .status span')?.innerText.match(/\d+/)?.[0] ||
            document.querySelector('.pagination .next')?.previousElementSibling?.innerText);
        this.CONTAINER = document.querySelectorAll('.results .video-list')[0];
        this.HAS_VIDEOS = !!this.GET_THUMBS(document.body).length > 0;
    }

    GET_THUMBS(html) {
        return html.querySelectorAll('.video-item:not(.clear-fix)');
    }

    THUMB_URL(thumb) {
        return thumb.querySelector('.thumb').href;
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('img');
        const imgSrc = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const title = sanitizeStr(thumb.querySelector('.name')?.innerText);
        const duration = (parseInt(thumb.querySelector('span.l')?.innerText) || 1) * 60;
        return { title, duration };
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const offset = parseInt(url.pathname.match(/\/(\d+)\/$/)?.pop()) || 1;
        if (!/\/\d+\/$/.test(url.pathname)) url.pathname = `${url.pathname}/${offset}/`;

        const iteratable_url = n => {
            url.pathname = url.pathname.replace(/\/\d+\/$/, `/${n}/`);
            return url.href;
        };

        return { offset, iteratable_url };
    }
}

const RULES = new SPANKBANG_RULES();

//====================================================================================================

function createPreviewElement(src, mount) {
    const elem = parseDom(`
    <div class="video-js vjs-controls-disabled vjs-touch-enabled vjs-workinghover vjs-v7 vjs-user-active vjs-playing vjs-has-started mp4t_video-dimensions"
         id="mp4t_video" tabindex="-1" lang="en" translate="no" role="region" aria-label="Video Player" style="display: none;">
      <video id="mp4t_video_html5_api" class="vjs-tech" tabindex="-1" loop="loop" autoplay="autoplay" muted="muted" playsinline="playsinline"></video>
      <div class="vjs-poster vjs-hidden" tabindex="-1" aria-disabled="false"></div>
      <div class="vjs-text-track-display" translate="yes" aria-live="off" aria-atomic="true">
        <div style="position: absolute; inset: 0px; margin: 1.5%;"></div>
      </div>
      <div class="vjs-loading-spinner" dir="ltr">
        <span class="vjs-control-text">Video Player is loading.</span>
      </div><button class="vjs-big-play-button" type="button" title="Play Video" aria-disabled="false">
      <span class="vjs-icon-placeholder" aria-hidden="true"></span>
      <span class="vjs-control-text" aria-live="polite">
    </div>`);

    mount.append(elem);
    const video = elem.querySelector('video');
    video.src = src;
    video.addEventListener('loadeddata', () => {
        elem.style.display = 'block';
    }, false);

    return {
        elem,
        removeElem: () => {
            video.removeAttribute('src');
            video.load();
            elem.remove();
        }
    };
}

function animate() {
    function handleThumbHover(e) {
        if (!(e.target.classList.contains('cover') && e.target.getAttribute('data-preview'))) return;
        const videoSrc = e.target.getAttribute('data-preview');
        const { removeElem } = createPreviewElement(videoSrc, e.target.parentElement.parentElement);
        e.target.parentElement.parentElement.addEventListener('mouseleave', removeElem, { once: true });
    }

    document.body.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(filter_);

if (RULES.HAS_VIDEOS) {
    animate();
    new JabroniOutfitUI(store);
    document.querySelectorAll('.video-list').forEach(c => {
        handleLoadedHTML(c, c);
    });
}

if (RULES.PAGINATION) {
    const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
}

