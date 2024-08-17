// ==UserScript==
// @name         CamWhores.tv Improved
// @namespace    http://tampermonkey.net/
// @version      1.94
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, private/public, include/exclude phrases. Mass friend request button. Download button
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.camwhores.tv/*
// @exclude      *.camwhores.tv/*mode=async*
// @grant        GM_addStyle
// @require      https://unpkg.com/billy-herrington-utils@1.1.1/dist/billy-herrington-utils.umd.js
// @require      https://unpkg.com/jabroni-outfit@1.4.7/dist/jabroni-outfit.umd.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1428433
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/497286/lskdb.user.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=camwhores.tv
// @downloadURL https://update.sleazyfork.org/scripts/494528/CamWhorestv%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494528/CamWhorestv%20Improved.meta.js
// ==/UserScript==
/* globals $ LSKDB PaginationManager DataManager */

const { Tick, findNextSibling, parseDom, fetchWith, fetchHtml, fetchText, SyncPull, wait, computeAsyncOneAtTime, timeToSeconds,
    parseIntegerOr, stringToWords, parseCSSUrl, circularShift, range, listenEvents, Observer, LazyImgLoader,
    watchElementChildrenCount, watchDomChangesWithThrottle, copyAttributes, replaceElementTag, isMob,
    objectToFormData, parseDataParams, sanitizeStr, chunks, getAllUniqueParents, downloader
} = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDurationAndPrivacy, JabroniOutfitUI, defaultSchemeWithPrivateFilter } = window.jabronioutfit;

const LOGO = `camwhores admin should burn in hell
⣿⢏⡩⡙⣭⢫⡍⣉⢉⡉⢍⠩⡭⢭⠭⡭⢩⢟⣿⣿⣻⢿⣿⣿⣿⣿⡿⣏⣉⢉⣿⣿⣻⢿⣿⣿⠛⣍⢯⢋⠹⣛⢯⡅⡎⢱⣠⢈⡿⣽⣻⠽⡇⢘⡿⣯⢻⣝⡣⣍⠸⣏⡿⣭⢋⣽⣻⡏⢬⢹
⣿⠦⡑⢜⡦⣳⡒⢄⠢⠌⢂⠜⣱⢋⡜⡡⢏⣾⢷⣻⢯⡿⣞⣿⣽⣻⢿⣹⢷⡂⣿⣾⡽⣻⣿⣿⢻⣌⣬⢩⢲⡑⡎⠼⡰⣏⣜⢦⡹⣷⣏⡟⡇⢨⡿⣝⡷⣎⠷⡌⢻⣜⡽⣯⣟⣷⣻⢷⣮⣹
⣿⢧⢉⢲⢣⢇⡯⢀⠒⢨⠐⢌⠰⣋⠞⡱⢫⡞⢯⡍⠧⡙⠞⣬⠳⣝⠪⡙⡷⣏⣿⢾⡽⣿⣿⣻⡟⡾⣥⢺⢈⣷⣽⣶⣭⣷⣾⣾⢿⣼⣳⡻⡇⠰⣿⣝⢾⡹⠞⡤⣏⣾⣳⣟⣾⣳⣯⡿⣵⢳
⡿⣇⠎⡜⣧⢺⣜⠠⡉⢄⠊⡄⠛⡌⢩⠳⣝⡎⠡⠐⠠⠉⠳⠄⠃⠄⢂⠱⡌⢃⣾⡿⣝⣿⣽⣿⣼⢳⡍⢞⣼⣿⣿⣿⣿⣿⣿⣿⣿⡞⣷⣛⡇⢘⡷⣯⢾⣹⢫⠔⣿⣞⡷⣿⣾⠿⣿⣿⡧⢿
⣿⣹⠒⡌⠤⠣⣄⠣⡐⢌⠰⣈⠱⢈⠆⡻⠜⡠⠁⢊⠄⠀⠄⢀⠂⠜⡬⢛⠥⢂⣿⡿⣽⣿⣯⣿⢧⣏⢾⡙⢻⡿⠓⡌⡛⠿⣿⣿⣿⣻⡵⣯⠇⢨⣟⣞⣳⡝⣎⢢⡽⣟⣳⣼⣧⣾⣼⣷⣿⣿
⣷⣏⠲⡈⢆⢳⣤⠃⡜⣀⠣⡐⢌⠢⢌⠑⡈⠐⡀⠠⠀⠌⠀⢂⠈⢌⡱⢈⠎⢀⣿⣿⣳⣿⡆⢻⡷⣞⡞⡬⢩⡐⣛⠶⣍⡲⣭⣿⣿⣿⡽⣞⡇⢨⣟⣾⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣷⣟⠧⡘⢠⠎⠔⠣⡐⢄⠢⡑⠌⠢⠌⡐⠤⢁⠐⠠⢁⠂⡁⠂⢌⡰⢆⡍⢂⠠⣿⡷⢿⠿⣃⢻⡛⡭⣝⢰⠣⡜⣈⠣⣜⣻⣿⣿⣿⣿⣟⣧⡇⠠⡿⣽⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣯⣗⢡⠂⠆⠀⠠⠑⡌⢢⠁⠌⡐⢢⢁⠒⡈⢌⠢⢅⢎⡰⢉⢢⡙⢦⡘⢄⠠⢏⡱⣋⢾⣩⠷⣙⠶⡡⢎⢷⡘⢧⣟⡾⣱⠿⣿⣿⣿⢿⣳⡇⢘⡷⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⡧⠩⠜⣠⢹⠆⠀⠀⠱⠈⠄⡈⠐⡀⠆⡈⠆⡁⢆⡘⠌⢎⡱⢋⡖⣩⠒⠥⢊⠴⣋⢶⡹⣎⡗⣯⠝⣎⡗⢎⠾⣹⢟⣮⢳⣭⢻⡹⣿⣿⡿⣯⡇⠘⣧⣽⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣟⣷⣻⢞⣻⡃⠀⠀⢡⠉⡐⠄⣃⠐⡄⠐⠠⢁⠂⠜⡈⠦⣑⢫⠴⡡⢉⠆⣭⢚⡭⢶⡹⢮⡝⣮⣛⢶⡹⣎⡰⣹⢎⡷⣫⢞⢧⡻⣜⢿⣿⣳⡇⢸⡿⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣾⣽⣯⡷⣿⣹⠇⡢⠑⡌⠰⣀⠊⠄⠃⡌⠠⢈⠐⡀⢂⠉⢆⡓⠰⡁⢞⡴⣋⡞⣧⣛⢧⣛⢶⡹⣎⠷⣝⢲⣭⣛⢶⡹⣎⢷⡹⣎⠿⣜⢷⡇⢸⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣿
⣿⡿⣿⣷⣿⢷⡛⡜⢠⠓⣌⠱⣀⠣⢌⡐⠠⢁⠂⠂⠄⠡⢈⠂⠬⡑⢬⠳⡜⣥⣛⢶⡹⢮⡝⣮⢳⡭⣟⢮⣳⢮⡝⣮⣗⡻⣎⢷⣭⢻⡜⣯⢇⠼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣏⣿⣷⣿⣽⣻⢿
⣿⣿⣿⣿⣻⡿⣗⠨⣅⠊⢤⠓⡄⡃⢆⡘⠰⡀⠌⠂⠌⡐⠠⠈⠄⡉⠊⠽⣸⢲⡝⣮⢽⣣⢟⡼⣣⢟⣼⣣⡟⣮⡽⢖⡻⡝⢮⢳⡎⣷⡹⣎⣿⣸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣇⠣⡜⢌⢂⠱⡈⠴⠡⢌⠱⡈⠤⢁⠒⠠⠁⠌⡐⢀⠁⢂⠄⠛⡼⣭⢷⡹⢮⣳⣛⣮⢷⣣⢟⠲⣙⠮⣵⢫⣛⡶⣽⣶⣿⣽⣾⢿⡿⣿⣾⣟⣿⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⢇⡓⠼⡌⢆⠣⢄⠃⡜⢀⠣⡘⢄⠣⡐⠠⢁⠐⠠⠀⠌⠠⢈⠐⣤⠙⠞⠽⢫⠗⠛⡼⣣⠟⡄⢣⢈⣿⣼⣿⣿⡹⠿⡽⢾⣿⣭⣿⢿⣧⡽⣿⣿⣿⣿⣿⣿⣿⣿⡿⣿⣿⣻⣽
⣿⣟⣯⣿⢾⣿⡧⢘⠤⣙⠢⡍⢢⠱⡐⠢⠄⡑⠌⢢⢁⠣⠄⠂⠄⢁⠂⡁⠂⡔⠠⢉⠜⡀⠣⢌⡱⠠⢅⠊⡜⢠⠃⠬⠉⢃⢉⡙⡒⠰⡡⠾⣿⣿⣿⣾⣻⣷⣿⣿⣿⣿⣽⣻⣿⢿⣽⣿⣿⢿
⣿⣾⣿⣾⣿⣿⡻⣌⢆⠡⢣⠙⣆⠡⣉⠳⣌⡔⢨⠀⠎⡰⢉⠜⡐⢢⠐⡠⢁⠐⡌⢂⠐⠠⠑⠢⠱⡉⢎⡱⢈⠣⢞⠤⡈⢄⠢⠖⡙⢢⠑⠢⢍⢿⣿⣿⣿⣷⡿⣷⣿⣻⣿⣿⣿⣮⡿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣽⣎⠧⡑⢊⡄⠓⡄⢣⠠⡙⠢⣍⠒⡄⠣⡘⢌⠡⢚⠰⡈⠔⠠⠀⠌⠠⢁⡃⠱⢈⠆⠴⢁⡜⢨⡖⠩⢌⠒⠡⠌⡐⢈⠒⡌⢢⠙⣿⣿⣿⣿⣿⣟⣿⣾⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡞⢿⣿⣥⡣⠌⡱⢈⠄⢣⠐⡡⢂⠍⡘⠱⢴⡈⢆⡡⢃⠍⡊⡕⡨⢄⢃⠢⡘⢠⢣⡘⢤⠣⡌⢧⡘⢥⣪⣼⣦⣶⣾⣿⣿⣶⠈⠂⠌⠻⣿⣿⣿⣿⣷⣿⣯⢿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡳⣎⠿⣿⣧⡄⠣⡘⢄⠣⡐⢡⠊⡔⢡⠎⢉⡑⠲⣧⡚⡴⣠⡑⢎⡴⢣⡝⣣⢖⡹⣎⣳⣹⣶⣭⣾⣿⣿⣿⣿⣿⣿⣿⡿⣧⢄⠀⡀⠉⢿⣿⣿⣿⣿⣿⣿⣽⡿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡷⡹⡞⣍⢿⣿⣳⠰⡈⠔⡈⢆⠱⣠⠃⠌⢂⡰⣱⣼⣿⢷⣧⣽⣺⣼⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣻⣽⣿⣿⣿⣿⣿⣿⣷⣾⠤⠀⠁⠂⠹⣿⣿⣿⣿⣿⣿⣿⣟⡿⣿
⣿⣯⣿⣿⡿⣾⣻⢽⡳⢧⡹⢞⢦⡹⢿⣷⣍⠲⡑⣎⠳⣄⣷⣾⣿⢿⣻⣟⣯⣿⣻⣿⣿⣿⣿⡿⣟⣿⣻⢿⣽⣻⣾⢷⣻⡽⣾⣿⣿⣯⣿⣿⣽⣿⣿⣿⣐⠀⠂⠀⠀⠿⣿⣿⣿⣿⣿⣿⣿⣿
⣟⢮⡝⡷⣛⠵⣋⢾⣙⢧⡙⣎⢳⡹⡌⢿⡿⣧⣵⢫⣿⠿⣟⣿⣻⢯⣷⡿⣯⣷⣟⣷⡿⣯⣷⢿⣻⣾⣟⣿⣾⣿⣿⣿⢿⣽⣟⣿⣿⣟⣿⣿⣿⣾⣿⣿⣿⣆⠀⠀⠀⠀⠐⣿⣿⣿⣿⣿⣿⣿
⣟⠮⣼⢱⡹⢎⣝⡲⡝⢮⡕⡎⣥⢓⡹⢆⡹⣿⣯⣟⣮⢷⣻⣞⣿⣻⢯⣿⡽⣷⡿⣯⣿⢿⣽⡿⣟⣯⣿⣿⣿⣿⣿⡿⣟⣿⣞⣯⣿⣿⣻⣿⣿⣷⡿⣿⣿⣿⣬⡀⠀⠀⠀⠀⠋⣻⣿⣿⣿⣿
⣯⠳⣌⠧⡝⣎⠶⣱⢋⢧⣛⠼⣄⠫⡴⡩⢆⠻⣿⣿⠽⣾⠽⣞⣷⣻⣟⡷⣿⢯⣿⢷⣻⣯⢷⣿⣻⣟⡿⣽⢿⡿⣿⣽⣿⣻⢾⣽⣿⣿⣻⣿⣿⣿⣿⣽⣿⣿⣿⣷⡀⠀⠀⠀⣀⣉⣿⣿⣿⣿
⣗⡫⣜⢣⡝⣬⠓⣥⢋⠶⣩⢞⡬⡓⡥⢓⠮⣅⠻⣿⣿⣽⣻⣽⣾⣻⢾⣻⣽⣻⣞⣯⢷⡯⣟⣾⢳⡯⢿⡽⣫⣽⡳⣏⡾⣽⣛⢾⡳⣟⢿⣻⢿⣿⣿⣿⡾⣿⣿⣷⣿⡔⣠⣿⣹⣯⣿⣿⣿⣿`;

GM_addStyle('.item.private .thumb, .item .thumb.private { opacity: 1 !important; }');

class CAMWHORES_RULES {
    constructor() {
        const { pathname } = window.location;
        this.IS_FAVOURITES = /\/my\/\w+\/videos/.test(pathname);
        this.IS_MEMBER_PAGE = /\/members\/\d+\/$/.test(pathname);
        this.IS_MINE_MEMBER_PAGE = /\/my\/$/.test(pathname);
        this.IS_MESSAGES = /^\/my\/messages\//.test(pathname);
        this.IS_MEMBER_VIDEOS = /\/members\/\d+\/(favourites\/)?videos/.test(pathname);
        this.IS_VIDEO_PAGE = /^\/videos\/\d+\//.test(pathname);
        this.IS_LOGGED_IN = document.querySelector('.member-links').innerText.includes('Log out');

        Object.assign(this, this.CALC_CONTAINER());
        this.HAS_VIDEOS = !!this.CONTAINER;

        if (this.IS_FAVOURITES || this.IS_MEMBER_VIDEOS) {
            this.INTERSECTION_OBSERVABLE = document.querySelector('.footer');
            watchDomChangesWithThrottle(document.querySelector('.content'), () => {
                Object.assign(this, this.CALC_CONTAINER());
            }, 10);
        }
    }

    CALC_CONTAINER = (document_ = document) => {
        const PAGINATION = Array.from(document_.querySelectorAll('.pagination'))?.[this.IS_MEMBER_PAGE ? 1 : 0];
        const PAGINATION_LAST = parseInt(PAGINATION?.querySelector('.last > a')?.getAttribute('data-parameters').match(/from\w*:(\d+)/)?.[1]);
        const CONTAINER = (PAGINATION?.parentElement.querySelector('.list-videos>div>form') ||
            PAGINATION?.parentElement.querySelector('.list-videos>div') ||
            document.querySelector('.list-videos>div'));
        return { PAGINATION, PAGINATION_LAST, CONTAINER };
    }

    IS_PRIVATE(thumb) {
        return thumb.classList.contains('private');
    }

    GET_THUMBS(html) {
        return Array.from(html.querySelectorAll('.list-videos .item') || html.querySelectorAll('.item') || html.children);
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('img.thumb');
        const imgSrc = img.getAttribute('data-original');
        img.removeAttribute('data-original');
        return { img, imgSrc };
    }

    THUMB_URL(thumb) {
        return thumb.firstElementChild.href;
    }

    THUMB_DATA(thumb) {
        const title = sanitizeStr(thumb.querySelector('.title').innerText);
        const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText);
        return { title, duration };
    }

    URL_DATA(url_, document_) {
        const url = new URL((url_ || window.location).href);
        let offset = parseInt((document_ || document).querySelector('.page-current')?.innerText) || 1;

        const { PAGINATION, PAGINATION_LAST } = this.CALC_CONTAINER(document_ || document);
        const el = PAGINATION?.querySelector('a[data-block-id][data-parameters]');
        const dataParameters = el?.getAttribute('data-parameters') || "";

        const attrs = {
            mode: 'async',
            function: 'get_block',
            block_id: el?.getAttribute('data-block-id'),
            ...parseDataParams(dataParameters)
        };

        Object.keys(attrs).forEach(k => url.searchParams.set(k, attrs[k]));

        const iteratable_url = n => {
            Object.keys(attrs).forEach(k => k.includes('from') && url.searchParams.set(k, n));
            url.searchParams.set('_', Date.now());
            return url.href;
        }

        return {
            offset,
            iteratable_url,
            PAGINATION_LAST
        };
    }
}

const RULES = new CAMWHORES_RULES();

//====================================================================================================

function rotateImg(src, count) {
    return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
}

function animate() {
    const tick = new Tick(ANIMATION_DELAY);
    $('img.thumb[data-cnt]').off()
    document.body.addEventListener('mouseover', (e) => {
        if (!e.target.tagName === 'IMG' || !e.target.classList.contains('thumb') || !e.target.getAttribute('src')) return;
        const origin = e.target.src;
        if (origin.includes('avatar')) return;
        const count = parseInt(e.target.getAttribute('data-cnt')) || 5;
        tick.start(
            () => { e.target.src = rotateImg(e.target.src, count); },
            () => { e.target.src = origin; });
        e.target.closest('.item').addEventListener('mouseleave', () => tick.stop(), { once: true });
    });
}

//====================================================================================================

const createDownloadButton = () => downloader({
    append: '.tabs-menu > ul',
    button: '<li><a href="#tab_comments" class="toggle-button" style="text-decoration: none;">download 📼</a></li>'
})

//====================================================================================================

// since script cannot be reloaded and scroll params need to be reset according to site options
function shouldReload() {
    const sortContainer = document.querySelector('.sort');
    if (!sortContainer) return;
    watchDomChangesWithThrottle(sortContainer, () => window.location.reload(), 1000);
}

//====================================================================================================

const DEFAULT_FRIEND_REQUEST_FORMDATA = objectToFormData({
    message: "",
    action: "add_to_friends_complete",
    function: "get_block",
    block_id: "member_profile_view_view_profile",
    format: "json",
    mode: "async"
});

const lskdb = new LSKDB();
const spull = new SyncPull();

function friendRequest(id) {
    const url = Number.isInteger(id) ? `${window.location.origin}/members/${id}/` : id;
    return fetch(url, { body: DEFAULT_FRIEND_REQUEST_FORMDATA, method: "post" });
}

function getMemberLinks(document) {
    return Array.from(document.querySelectorAll('.item > a')).map(l => l.href).filter(l => /\/members\/\d+\/$/.test(l));
}

async function getMemberFriends(id) {
    const url = `${window.location.origin}/members/${id}/friends/`;
    const document_ = await fetchHtml(url);
    const { offset, iteratable_url, PAGINATION_LAST } = RULES.URL_DATA(new URL(url), document_);
    const pages = PAGINATION_LAST ? range(PAGINATION_LAST, 1).map(u => iteratable_url(u)) : [url];
    const friendlist = (await computeAsyncOneAtTime(pages.map(p => () => fetchHtml(p)))).flatMap(getMemberLinks).map(u => u.match(/\d+/)[0]);
    friendlist.forEach(m => lskdb.setKey(m));
    await processFriendship();
}

async function processFriendship() {
    console.log('processFriendship');
    if (!lskdb.isLocked()) {
        const friendlist = lskdb.getKeys(30);
        if (friendlist?.length < 1) return;
        lskdb.lock(true);
        const urls = friendlist.map(id => `${window.location.origin}/members/${id}/`);
        await computeAsyncOneAtTime(urls.map(url => () => friendRequest(url)));
        lskdb.lock(false);
        await processFriendship();
    }
}

function createFriendButton() {
    const button = parseDom('<a href="#friend_everyone" style="background: radial-gradient(#5ccbf4, #e1ccb1)" class="button"><span>Friend Everyone</span></a>');
    document.querySelector('.main-container-user > .headline').append(button);
    const memberid = window.location.pathname.match(/\d+/)[0];
    button.addEventListener('click', () => {
        button.style.background = 'radial-gradient(#ff6114, #5babc4)';
        button.innerText = 'processing requests';
        getMemberFriends(memberid).then(() => {
            button.style.background = 'radial-gradient(blue, lightgreen)';
            button.innerText = 'friend requests sent';
        });
    }, { once: true });
}

//====================================================================================================

const greenItem = 'linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green';
const redItem = 'linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red';

function checkPrivateVidsAccess() {
    document.querySelectorAll('.item.private').forEach(async item => {
        const videoURL = item.firstElementChild.href;
        const doc = await fetchHtml(videoURL);
        const haveAccess = !/This video is a private video uploaded by/ig.test(doc?.innerText);
        item.style.background = haveAccess ? greenItem : redItem;
    });
}

//====================================================================================================

function getUserInfo(document) {
    const uploadedCount = parseInt(document.querySelector('#list_videos_uploaded_videos strong')?.innerText.match(/\d+/)[0]) || 0;
    const friendsCount = parseInt(document.querySelector('#list_members_friends .headline')?.innerText.match(/\d+/).pop()) || 0;
    // const isFriend = /is in your friends list/gi.test(document.body.innerText);
    return { uploadedCount, friendsCount }
}

async function acceptFriendRequest(id) {
    const url = `https://www.camwhores.tv/my/messages/${id}/`;
    await fetch(url, {
        "headers": {
            "Accept": "*/*",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        "body": `action=confirm_add_to_friends&message_from_user_id=${id}&function=get_block&block_id=list_messages_my_conversation_messages&confirm=Confirm&format=json&mode=async`,
        "method": "POST",
    });
    await fetchHtml(`https://www.camwhores.tv/members/${id}/`).then(doc => console.log('userInfo', getUserInfo(doc), url));
}

function clearMessages() {
    const messagesURL = id => `https://www.camwhores.tv/my/messages/?mode=async&function=get_block&block_id=list_members_my_conversations&sort_by=added_date&from_my_conversations=${id}&_=${Date.now()}`;
    const last = parseInt(document.querySelector('.pagination-holder .last > a').href.match(/\d+/)?.[0]);
    if (!last) return;

    for (let i = 0; i < last; i++) {
        spull.push({
            v: () =>
                fetchHtml(messagesURL(i)).then(html_ => {
                    const messages = Array.from(html_?.querySelectorAll('#list_members_my_conversations_items .item > a') || []).map(a => a.href);
                    messages.forEach((m, j) => spull.push({ v: () => checkMessageHistory(m), p: 1 }));
                }), p: 2
        });
    }

    let c = 0;
    function checkMessageHistory(url) {
        fetchHtml(url).then(html => {
            const hasFriendRequest = html.querySelector('input[value=confirm_add_to_friends]');
            const hasOriginalText = html.querySelector('.original-text')?.innerText;
            const id = url.match(/\d+/)[0];
            if (!(hasOriginalText || hasFriendRequest)) {
                const deleteURL = `${url}?mode=async&format=json&function=get_block&block_id=list_messages_my_conversation_messages&action=delete_conversation&conversation_user_id=${id}`;
                spull.push({
                    v: () => fetch(deleteURL).then(r => {
                        console.log(r.status == 200 ? ++c : '', r.status, 'delete', id);
                    }), p: 0
                });
            } else {
                console.log(hasOriginalText, url);
                if (hasFriendRequest) {
                    spull.push({ v: () => acceptFriendRequest(id), p: 0 });
                }
            }
        });
    }
}

//====================================================================================================

function route() {
    if (RULES.IS_LOGGED_IN) {
        setTimeout(processFriendship, 3000);
        if (RULES.IS_MEMBER_PAGE) {
            createFriendButton();
        }
    }

    if (RULES.PAGINATION && !RULES.IS_MEMBER_PAGE && !RULES.IS_MINE_MEMBER_PAGE) {
        const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
        shouldReload();
    }

    if (RULES.HAS_VIDEOS) {
        const containers = getAllUniqueParents(RULES.GET_THUMBS(document.body));
        containers.forEach(c => handleLoadedHTML(c, c));
        defaultSchemeWithPrivateFilter.privateFilter.push(
            { type: "button", innerText: "check access 🔓", callback: checkPrivateVidsAccess });
        const ui = new JabroniOutfitUI(store, defaultSchemeWithPrivateFilter);
        animate();
    }

    if (RULES.IS_VIDEO_PAGE) {
        createDownloadButton();
    }

    if (RULES.IS_MESSAGES) {
        const button = parseDom(`<button>clear messages</button>`);
        document.querySelector('.headline').append(button);
        button.addEventListener('click', clearMessages);
    }
}

//====================================================================================================

const SCROLL_RESET_DELAY = 500;
const ANIMATION_DELAY = 500;

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { state, stateLocale } = store;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(filter_);

console.log(LOGO);
route();
