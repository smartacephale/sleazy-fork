// ==UserScript==
// @name         XVideos Improved
// @namespace    http://tampermonkey.net/
// @version      1.88
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xvideos.com/*
// @exclude      https://*.xvideos.com/embedframe/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.1.8/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1458190
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js?version=1459738
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @downloadURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.meta.js
// ==/UserScript==
/* globals $ DataManager PaginationManager */

Object.assign(unsafeWindow, { bhutils: window.bhutils });
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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
        this.PAGINATION_LAST = parseInt(Array.from(document.querySelectorAll('.pagination a:not(.next-page)')).pop()?.innerText);
        this.CONTAINER = document.querySelector('#content')?.firstElementChild;
        this.HAS_VIDEOS = document.querySelector('div.thumb-block[id^=video_]');
    }

    GET_THUMBS(html) {
        return html.querySelectorAll('div.thumb-block[id^=video_]:not(.thumb-ad)');
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
        const title = bhutils.sanitizeStr(thumb.querySelector('.title').innerText);
        const durationEl = thumb.querySelector('.duration').innerText;
        const duration = parseInt(durationEl) * (durationEl.includes('m') ? 60 : 1);

        setTimeout(() => {
            const id = parseInt(thumb.getAttribute('data-id'));
            unsafeWindow.xv.thumbs.prepareVideo(id);
        }, 200);

        return { title, duration }
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const offset = parseInt(url.searchParams.get('p') || url.pathname.match(/\/(\d+)\/?$/)?.pop()) || 0;
        if (!url.searchParams.get('k')) {
            if (url.pathname === '/') url.pathname = '/new';
            if (!/\/(\d+)\/?$/.test(url.pathname)) url.pathname = `${url.pathname}/${offset}/`;
        }

        const iteratable_url = (n) => {
            if (url.searchParams.get('k')) {
                url.searchParams.set('p', n);
            } else {
                url.pathname = url.pathname.replace(/\/(\d+)\/?$/, `/${n}/`);
            }
            return url.href;
        }

        return { offset, iteratable_url }
    }
}

const RULES = new XVIDEOS_RULES();

//====================================================================================================

function createPreviewElement(src, mount) {
    const elem = bhutils.parseDom(`
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
        }
    };
}

function getVideoURL(src) {
    return src
        .replace(/thumbs169ll?/, 'videopreview')
        .replace(/\/\w+\.\d+\.\w+/, '_169.mp4')
        .replace(/(-\d+)_169\.mp4/, (_, b) => `_169${b}.mp4`)
}

function animate() {
    function handleThumbHover(e) {
        if (!(e.target.tagName === 'IMG' && e.target.id.includes('pic_'))) return;
        const videoSrc = getVideoURL(e.target.src);
        const { removeElem } = createPreviewElement(videoSrc, e.target);
        e.target.parentElement.parentElement.parentElement.addEventListener('mouseleave', removeElem, { once: true });
    }

    RULES.CONTAINER.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

console.log(LOGO);

const SCROLL_RESET_DELAY = 350;

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);

function route() {
    if (RULES.PAGINATION) {
        new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    }

    if (RULES.HAS_VIDEOS) {
        animate();
        handleLoadedHTML(RULES.CONTAINER)
        new JabroniOutfitUI(store);
    }
}

route();
