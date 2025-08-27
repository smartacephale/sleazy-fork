// ==UserScript==
// @name         XVideos Improved
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xvideos.com/*
// @exclude      https://*.xvideos.com/embedframe/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.4.2/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @downloadURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.meta.js
// ==/UserScript==

const { DataManager, createInfiniteScroller, sanitizeStr, timeToSeconds, parseDom } = window.bhutils;
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
    delay = 300;

    constructor() {
        this.paginationElement = [...document.querySelectorAll('.pagination')].pop();
        this.paginationLast = parseInt(document.querySelector('.last-page')?.innerText) || 1;
        Object.assign(this, this.URL_DATA());
        this.CONTAINER = document.querySelector('#content')?.firstElementChild;
        this.HAS_VIDEOS = !!document.querySelector('div.thumb-block[id^=video_]');
    }

    GET_THUMBS(html) { return html.querySelectorAll('div.thumb-block[id^=video_]:not(.thumb-ad)'); }

    THUMB_IMG_DATA() { return ({}); };

    THUMB_URL(thumb) { return thumb.querySelector('.title a').innerText; }

    THUMB_DATA(thumb) {
      const uploader = sanitizeStr(thumb.querySelector('[class*=name]')?.innerText);
      const title = sanitizeStr(thumb.querySelector('[class*=title]')?.innerText)
        .concat(uploader ? ` user:${uploader}` : "");
      const duration = timeToSeconds(sanitizeStr(thumb.querySelector('[class*=duration]')?.innerText));

      setTimeout(() => {
          const id = parseInt(thumb.getAttribute('data-id'));
          unsafeWindow.xv.thumbs.prepareVideo(id);
      }, 200);

      return { title, duration }
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const paginationOffset = parseInt(url.searchParams.get('p') || url.pathname.match(/\/(\d+)\/?$/)?.pop()) || 0;
        if (!url.searchParams.get('k')) {
            if (url.pathname === '/') url.pathname = '/new';
            if (!/\/(\d+)\/?$/.test(url.pathname)) url.pathname = `${url.pathname}/${paginationOffset}/`;
        }

        const paginationUrlGenerator = (n) => {
            if (url.searchParams.get('k')) {
                url.searchParams.set('p', n);
            } else {
                url.pathname = url.pathname.replace(/\/(\d+)\/?$/, `/${n}/`);
            }
            return url.href;
        }

        return { paginationOffset, paginationUrlGenerator }
    }
}

const RULES = new XVIDEOS_RULES();

//====================================================================================================

function createPreviewElement(src, mount) {
    const elem = parseDom(`
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
        .replace(/thumbs169l{1,}/, 'videopreview')
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

function route() {
    if (RULES.paginationElement) {
      createInfiniteScroller(store, parseData, RULES);
    }

    if (RULES.HAS_VIDEOS) {
        animate();
        parseData(RULES.CONTAINER)
        new JabroniOutfitUI(store);
    }
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
