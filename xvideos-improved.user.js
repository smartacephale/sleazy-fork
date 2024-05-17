// ==UserScript==
// @name         XVideos Improved
// @namespace    http://tampermonkey.net/
// @version      1.5.1
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xvideos.com/*
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @downloadURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.meta.js
// ==/UserScript==
/* globals jQuery, $, Vue, createApp, watch, reactive, DefaultState,
 timeToSeconds, parseDOM, parseIntegerOr, fetchHtml, stringToWords, Observer
 LazyImgLoader, PersistentState, DataManager, PaginationManager, VueUI */

const LOGO = `
⡐⠠⠀⠠⠐⡀⠆⡐⠢⡐⠢⡁⢆⠡⢂⠱⡈⠔⣈⠒⡌⠰⡈⠔⢢⢁⠒⡰⠐⢢⠐⠄⣂⠐⡀⠄⢂⠰⠀⢆⡐⠢⢐⠰⡀⠒⢄⠢⠐⣀⠂⠄⢀⢂⠒⡰⠐⡂⠔⠂⡔⠂⡔⠂⡔⠂⡔⠂⢆⠡
⠠⡁⠂⠄⠐⡀⠆⡁⠆⡑⠤⢑⡈⢆⠡⢂⠱⡈⡄⠣⢌⠱⡈⠜⡠⢊⠔⡁⢎⡐⠌⡂⢄⠂⠄⠈⠄⢂⡉⠤⢀⠃⡌⡐⠤⠉⡄⠂⠥⠀⠌⡀⠰⢈⠒⢠⠑⡈⠔⡡⠂⢅⢂⠱⢀⠣⡐⢩⢀⠣
⢁⢂⡉⠐⡀⠀⠂⠔⠂⡔⢈⠆⠰⡈⢆⠡⢂⠱⣈⠱⡈⢆⠱⡈⠔⡡⢊⠔⡂⠔⡨⠐⠄⢊⠐⠈⡐⠠⠐⢂⠡⠌⡐⠄⠢⠑⡠⠉⢄⠁⠂⠄⢂⠡⢊⡐⢂⠡⠊⢄⠱⠈⡄⢊⠄⡃⠔⡡⠌⢒
⡂⠆⢨⠐⠠⢀⠁⠌⡐⠄⢊⠄⡃⠜⣀⠣⠌⡒⢄⠣⡘⢄⠣⡘⠤⡑⢌⠰⡈⢆⠁⢎⠈⠤⢈⠀⠄⠡⠘⡀⠆⠒⠠⢈⠁⠆⠡⠌⠠⢈⠐⠀⠌⡐⠂⡔⠨⡐⢉⠄⣊⠡⡐⢡⠊⠔⡡⢂⠍⡂
⠐⡉⢄⢊⢁⠂⠄⠐⠠⠘⢠⠘⡀⢎⠠⢂⠱⡈⠆⡑⢌⠢⡑⢄⠣⡘⢄⠣⡐⢌⡘⠠⡉⠐⡀⠂⢀⠁⠂⠔⡈⠠⠁⠂⢈⠠⠁⠌⡐⠀⠂⠀⠌⡐⠡⠄⢃⠌⡂⠜⡀⢆⠑⣂⠱⡈⠔⡡⢂⠱
⢃⠜⢠⠊⢄⢊⠐⠠⠀⡁⠆⢂⠡⠂⡅⢊⠔⡁⢎⠰⡈⢆⠱⡈⢆⠱⡈⢆⠡⢂⠔⠡⡐⠡⠐⠀⠀⠌⠐⠠⠀⠐⠀⠂⠀⡀⠈⠀⠀⢁⠀⠀⠂⠌⡐⡉⢄⠢⢑⠨⡐⠌⡒⢄⠢⡑⢌⠰⡁⢆
⠆⡘⢄⠊⡔⡈⠌⡄⢁⠀⠌⠠⠡⠑⡠⢃⠰⢈⠢⢡⠘⠄⡃⠜⡠⢃⠔⡈⢆⠡⠊⠔⡁⢂⠡⠀⠈⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀⡁⢂⠡⡐⠌⡰⢈⠂⡅⢊⠔⡨⠐⡌⢢⠡⡘⢠
⠰⢡⢈⠒⠤⢑⠨⡐⠄⢂⠀⠁⠆⡑⢠⠂⡡⠊⢄⠃⡜⢠⠑⡌⠰⣈⠢⢑⡈⠆⢩⠐⡐⡀⢂⠀⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢀⠂⢡⠐⢡⢂⠡⢊⠰⣁⠊⡔⢡⠘⠤⢑⡈⢆
⠁⠆⡌⡘⠰⡈⠆⢡⠘⡠⠌⢀⠂⠰⢀⠂⢅⡘⠠⢊⠐⡂⠥⡈⠥⠐⠌⡂⠔⡉⢄⠂⢡⠐⠠⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠁⢀⠂⠌⠄⢊⠄⠢⡑⡈⠆⡄⢣⠈⢆⠩⡐⠢⢌⠰
⠩⡐⠤⢁⠣⡐⡉⢄⢊⡐⠌⠠⢀⠁⠂⢌⠠⠐⡡⢂⠡⢘⡀⠆⡡⢉⠂⢅⠊⡐⠄⡉⠄⢂⠁⠄⠀⠈⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠐⠀⠄⠠⢈⠐⣈⠢⠌⢡⠐⡡⢊⡐⢂⠍⡄⢃⠌⡡⠂⠥
⡑⠄⠣⠌⡂⢅⡘⢠⠂⠔⣈⠡⠂⠄⠁⠂⠄⢃⠐⠤⠑⢂⠰⠈⠤⢁⠊⢄⠊⡐⠌⡐⠈⠄⠂⢀⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠄⡈⠄⠐⠀⢂⠐⡀⠢⠘⡠⠑⡠⢁⠆⡡⢊⠰⢈⠰⢁⠩⡐
⢆⡉⠆⡑⠌⡄⢢⠁⡜⠐⡠⠂⠥⠈⠄⠈⡐⢀⠊⠄⠡⠊⠄⡉⡐⡈⠔⠂⠌⡐⠠⢀⠁⠂⠌⠀⢀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠠⠐⠀⡀⠂⠈⢀⠂⠄⠡⢁⠄⢃⠰⢁⠢⢁⠆⢡⠊⠰⡈⠔⣀
⢄⠢⡑⠌⡒⢨⠐⡌⢠⠃⠤⠑⢂⠉⠄⠡⢀⠂⠌⡀⠃⠌⡐⠠⢁⡐⠈⠤⠁⠄⡁⠂⠌⠐⠠⠈⠀⠀⠐⠀⠀⡀⠀⠀⠀⠀⠀⠄⠂⠀⡀⠁⡀⠂⠌⡐⠠⠈⠄⠒⡈⠄⠃⡌⠄⢊⠡⠐⢂⠄
⣈⠒⢌⠰⡁⢆⠱⢈⠔⣈⠢⠑⣈⠰⠈⠄⡉⢿⣶⣤⣁⠒⠠⢁⠂⠄⡁⢂⠁⠂⠄⠡⠈⡐⠀⠂⢁⠈⠀⠠⠀⠀⠀⢀⠁⠀⠂⠀⠠⠀⠀⠐⠀⠌⠀⠄⠡⠈⠄⠃⠄⣉⠰⠀⠎⡐⢈⠡⢂⠘
⢆⡘⠄⡃⢌⠢⡘⢄⠊⡄⠢⠑⣀⠢⠁⠌⡐⠀⠻⣿⣿⣿⣷⣦⣌⡐⢀⠂⠌⡐⠈⠄⡁⠠⢈⠐⠀⡀⠂⠀⢀⠀⠀⠠⠈⢀⡀⠈⠀⠀⠁⠠⠈⡀⠡⠈⠄⠡⢈⠐⡈⠄⢂⠁⠒⡈⠄⠒⡈⣄
⢀⠢⠑⡌⢂⠱⡈⢄⠣⡐⡁⢣⠀⠆⣉⠐⡠⢁⠂⠹⣟⣾⢳⣯⡟⣿⢯⡶⣦⣤⣁⠂⠄⡁⢀⠂⡐⣀⣄⡬⡴⢺⣀⡁⠄⣾⡹⢶⡖⢧⣀⡁⠠⢀⠁⠂⠌⡐⢀⠂⡐⠈⠄⣈⢡⣰⣬⢷⣟⣿
⠠⠌⡑⢠⠃⢆⡑⠌⡰⠠⢑⠠⡑⡈⢄⢂⡁⢂⠌⠠⠹⣞⡽⡲⢏⡷⣋⠷⡳⡼⣩⢟⡹⡍⣏⠽⣡⠳⣜⢲⡙⢧⠣⣜⢣⠧⣙⢦⡙⢮⠱⣙⠒⢦⠨⡔⣠⠐⣄⢢⢤⡙⢶⡩⢟⠶⣹⢞⡼⣺
⢄⠊⡔⢡⠘⡄⢢⠑⡄⠣⠌⠒⡠⢁⢂⠂⡌⡐⡈⠆⣁⠺⡴⢫⡝⡲⢍⡳⣙⠲⣅⠺⡰⠱⡈⠆⡅⠣⢌⠢⣉⠆⠳⣌⠣⢇⠣⢎⡘⢆⠓⠌⡡⢂⠡⡐⢠⠁⠆⡌⢢⠙⢢⡙⢮⡹⡱⢎⡳⣍
⢀⠃⡌⢂⠥⠘⡄⢊⠤⠑⡨⢁⠔⡁⢢⠡⡐⠤⡑⠌⡄⢣⢍⡣⡜⡱⣍⠲⡡⠓⡌⠱⡐⡡⢘⠰⣈⠱⣈⠒⠤⣉⠓⠤⢋⡜⢄⠣⡘⢌⠪⠔⡡⢂⠡⢂⠅⡊⠔⡈⢆⣉⠒⡌⠦⢱⡉⢮⡱⣹
⠢⡑⡈⠆⡌⠱⢈⠆⢢⠑⠄⣃⠰⢈⠔⣂⠑⢢⠑⡌⠰⣡⠚⡴⢡⠓⡌⡱⠐⡍⡐⢣⡐⡡⢎⡐⢂⢃⠒⡌⠒⡤⢉⢎⡡⠜⢢⠑⡌⢢⠑⠬⡐⢥⢊⡔⢨⡐⡡⡑⠢⡄⢋⡔⡉⢆⡩⢆⡱⢢
⡐⢡⠘⡰⢈⡑⠢⡘⠄⡊⠔⡠⢃⠌⡒⠤⢉⠂⠥⢐⡁⠦⡙⢤⢃⠣⢜⡠⢋⠔⡡⢃⠴⡁⠦⡘⣌⢊⠵⣈⠓⡌⢎⡰⢢⡙⢆⡣⠜⡤⢋⢖⡩⢆⢣⡜⣡⠖⣡⠜⣡⠘⢢⠰⡉⢆⠲⠌⡔⠣
⠨⠄⡃⠔⠡⣀⠃⡄⢃⠌⢢⠑⠌⢢⠑⡌⢂⠍⢢⢡⠘⡰⢉⠖⣈⠣⢆⠱⢌⢊⡱⢌⢢⡙⠴⡱⢌⢎⢲⢡⢫⠜⣆⠳⣥⢋⢮⡱⢫⡜⣭⢲⡱⣋⠶⣩⢖⡹⢢⡝⣢⠝⣢⢃⡕⢊⡜⣘⠰⢩
⠐⠌⡐⢈⠡⢀⠒⡈⠤⠘⡄⢊⡜⢠⢃⠜⡨⠌⣅⠢⢍⢒⡉⠦⢡⢃⠎⡜⣂⢣⠒⡌⢦⡑⣣⠱⢎⡎⣎⢧⢣⡛⣬⣓⢮⣙⢦⡝⣧⣛⢶⣣⠷⣭⢳⢧⡺⡱⣇⠞⣥⡚⡵⢪⡜⣥⠒⡬⢡⢣
⠀⢄⠐⡠⢂⠆⢢⠑⡌⡱⢈⠥⣘⢂⠎⢢⡑⡩⢄⡓⡌⠦⡑⡍⢦⡉⢞⡰⢡⢎⡱⣍⠶⣉⠶⣙⠮⡼⡜⣎⠧⣝⠶⣭⠞⣭⢞⡽⣲⡝⣮⢳⡻⣜⢧⡳⣝⡳⣎⢟⢦⡽⣘⢧⡚⡴⣋⢖⡣⢎
⠨⢄⠣⣐⠡⢊⡔⠡⢎⠰⣉⠲⢄⡋⢬⡑⠴⣑⠪⡔⣌⢣⠱⡘⢦⡙⢦⢱⢋⢦⠳⡜⢮⡱⣋⣎⠷⣱⢏⡾⣹⢎⡿⣜⡻⣜⢯⡞⣵⢻⡜⣧⢻⡜⣧⢻⡜⣧⡝⣮⠳⣜⡱⢎⡵⢣⡙⢮⡱⢎
⢁⠎⡐⠆⡥⢃⡌⠓⡬⢑⢢⢃⠎⡜⢢⠜⡱⢌⡱⡘⡤⢣⡙⡜⢦⡹⢜⡪⣝⢪⢳⣙⠶⣳⡹⣬⢻⡱⣏⢾⡱⢯⡞⣵⡻⣝⡮⡽⣎⢷⡹⣎⢷⡹⣎⢷⡹⡖⡽⣒⡻⣌⡳⣍⢖⡣⡝⢦⠹⡜
⢊⠬⡑⢎⡰⢡⢊⠵⣈⠇⡎⡜⡸⢌⠣⢎⡱⢊⡴⢣⢱⢣⡹⠜⣦⡙⢮⡱⢎⢧⡳⢭⡞⡵⣳⢭⡳⣝⢮⡳⣏⡷⣹⢧⣻⣜⣳⡝⣮⢳⡻⣜⢧⡻⣜⢧⣛⡽⣜⢣⡗⣥⠳⡜⢮⡑⢮⣑⢫⢜`;


class XVIDEOS_RULES {
    constructor() {
        this.PAGINATION = Array.from(document.querySelectorAll('.pagination')).pop();
        this.PAGINATION_LAST = parseInt(document.querySelector('.last-page')?.innerText);
        this.CONTAINER = document.querySelector('#content')?.firstElementChild;
        this.HAS_VIDEOS = document.querySelector('div.thumb-block[id^=video_]');
    }

    GET_THUMBS(html) {
        return html.querySelectorAll('div.thumb-block[id^=video_]:not(.thumb-ad)')
    }

    THUMB_IMG_DATA() { return ({}); };

    GET_THUMB_IMG(thumb) {
        const img = thumb.querySelector('img');
        const imgSrc = img?.getAttribute('data-src');
        if (img && imgSrc) {
            img.setAttribute('data-src', imgSrc.replace('THUMBNUM', '1'));
        }
        return img;
    }

    THUMB_URL(thumb) { return thumb.querySelector('.title a').innerText; }

    THUMB_DATA(thumb) {
        const title = thumb.querySelector('.title').innerText.toLowerCase();
        const durationEl = thumb.querySelector('.duration').innerText;
        const duration = parseInt(durationEl) * (durationEl.includes('m') ? 60 : 1);

        setTimeout(() => {
            const id = parseInt(thumb.getAttribute('data-id'));
            unsafeWindow.xv.thumbs.prepareVideo(id);
        }, 200);

        return {
            title,
            duration
        }
    }

    URL_DATA() {
        const { href, pathname, search, origin } = window.location;
        const url = new URL(href);
        let offset;
        let iteratable_url;

        if (url.searchParams.get('k')) {
            offset = parseInt(url.searchParams.get('p')) || 1;
            iteratable_url = n => {
                url.searchParams.set('p', n)
                return url.href;
            }
        } else {
            const mres = pathname.split(/\/(\d+)\/?$/);
            const basePathname = pathname === '/' ? '/new' : mres[0];
            offset = parseInt(mres[1]) || 1;
            iteratable_url = n => `${origin}${basePathname}/${n}`;
        }

        return {
            offset,
            iteratable_url
        };
    }
}

const RULES = new XVIDEOS_RULES();

//====================================================================================================

function createPreviewElement(src, mount) {
    const elem = parseDOM(`
    <div class="videopv" style="display: none;">
        <video autoplay="autoplay" playsinline="playsinline" muted="muted"></video>
    </div>`);

    mount.after(elem);
    const video = elem.querySelector('video');
    video.src = src;
    video.addEventListener('loadeddata', () => {
        mount.style.opacity = '0';
        elem.style.display = 'block';
        elem.style.background = '#000';
    }, false);

    return {
        elem,
        removeElem: () => {
            video.removeAttribute('src');
            video.load();
            elem.remove();
            mount.style.opacity = '1';
        }};
}

function getVideoURL(src) {
    return src
        .replace(/thumbs169ll?/, 'videopreview')
        .replace(/\/\w+\.\d+\.\w+/, '_169.mp4')
        .replace(/(-\d+)_169\.mp4/, (_,b) => `_169${b}.mp4`)
}

function animate() {
    function handleThumbHover(e) {
        if (!(e.target.tagName === 'IMG' && e.target.id.includes('pic_'))) return;
        const videoSrc = getVideoURL(e.target.src);
        const {elem, removeElem} = createPreviewElement(videoSrc, e.target);
        e.target.parentElement.parentElement.parentElement.addEventListener('mouseleave', removeElem, { once: true });
    }

    RULES.CONTAINER.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const defaultState = new DefaultState();
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

function route() {
    if (RULES.PAGINATION) {
        const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    }

    if (RULES.HAS_VIDEOS) {
        animate();
        handleLoadedHTML(RULES.CONTAINER)
        const ui = new VueUI(state, stateLocale);
    }
}

route();
