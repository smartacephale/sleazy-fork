// ==UserScript==
// @name         CamWhores.tv Improved
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @license      MIT
// @description  Infinite scroll (optional). Lazy loading. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.camwhores.tv/*
// @grant        GM_addStyle
// @grant        GM_download
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=camwhores.tv
// @downloadURL https://update.sleazyfork.org/scripts/494528/CamWhorestv%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494528/CamWhorestv%20Improved.meta.js
// ==/UserScript==
/* globals jQuery, $, Vue, waitForElementExists,
 timeToSeconds, parseDOM, fetchHtml, DefaultState, circularShift, getAllUniqueParents,
 PersistentState, DataManager, PaginationManager, VueUI, Tick, watchDomChangesWithThrottle, */

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

class CAMWHORES_RULES {
    constructor() {
        const { pathname } = window.location;

        this.IS_FAVOURITES = /\/my\/\w+\/videos/.test(pathname);
        this.IS_MEMBER_PAGE = /\/members\/\d+\/$/.test(pathname);
        this.IS_MEMBER_VIDEOS = /\/members\/\d+\/videos/.test(pathname);

        this.CALC_CONTAINER();

        this.HAS_VIDEOS = !!this.CONTAINER;

        if (this.IS_FAVOURITES || this.IS_MEMBER_VIDEOS) {
            this.INTERSECTION_OBSERVABLE = document.querySelector('.footer');
            watchDomChangesWithThrottle(document.querySelector('.content'), () => {
                this.CALC_CONTAINER();
            }, 10);
        }
    }

    CALC_CONTAINER = () => {
        this.PAGINATION = Array.from(document.querySelectorAll('.pagination'))?.[this.IS_MEMBER_PAGE ? 1 : 0];

        this.PAGINATION_LAST = parseInt(this.PAGINATION?.querySelector('.last')?.firstElementChild.getAttribute('data-parameters').match(/from\w*:(\d+)/)?.[1]);
        this.PAGINATION?.parentElement.querySelector('.list-videos>div') ||
            document.querySelector('.list-videos>div');

        this.CONTAINER = (this.PAGINATION?.parentElement.querySelector('.list-videos>div>form') ||
                          this.PAGINATION?.parentElement.querySelector('.list-videos>div') ||
                          document.querySelector('.list-videos>div'));
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
        const title = thumb.querySelector('.title').innerText.toLowerCase();
        const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText || '0');
        return {
            title,
            duration
        }
    }

    URL_DATA() {
        const { href, pathname, search, origin } = window.location;
        const url = new URL(href);
        let offset = parseInt(document.querySelector('.page-current')?.innerText) || 1;

        const el = this.PAGINATION.querySelector('a[data-block-id][data-parameters]');
        const dataParameters = el.getAttribute('data-parameters') || "";

        const attrs = {
            'mode':'async',
            'function': 'get_block',
            'block_id': el?.getAttribute('data-block-id'),
            'q': dataParameters.match(/q\:([\w+|\+]*)/)?.[1],
            'category_ids': dataParameters.match(/category_ids\:([\w+|\+]*)/)?.[1],
            'sort_by': dataParameters.match(/sort_by\:([\w+|\+]*)/)?.[1],
            'fav_type': dataParameters.match(/fav_type\:([\w+|\+]*)/)?.[1],
            'playlist_id': dataParameters.match(/playlist_id\:([\w+|\+]*)/)?.[1],
        };

        const attrs_iterators = {
            'from_videos': dataParameters.match(/from_videos[\+from_albums)]*\:([\w+|\+]*)/)?.[1],
            'from_albums': dataParameters.match(/from_albums\:([\w+|\+]*)/)?.[1],
            'from': dataParameters.match(/from\:([\w+|\+]*)/)?.[1],
            'from_my_fav_videos': dataParameters.match(/from_my_fav_videos\:([\w+|\+]*)/)?.[1]
        }

        Object.keys(attrs).forEach(k => attrs[k] && url.searchParams.set(k, attrs[k]));
        Object.keys(attrs_iterators).forEach(k => !attrs_iterators[k] && delete attrs_iterators[k]);

        const iteratable_url = n => {
            Object.keys(attrs_iterators).forEach(a => url.searchParams.set(a, n));
            url.searchParams.set('_', Date.now());
            return url.href;
        }

        return {
            offset,
            iteratable_url
        };
    }
}

const RULES = new CAMWHORES_RULES();

//====================================================================================================

function rotateImg(src, count) {
    return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
}

function animate() {
    const tick = new Tick(500);
    $('img.thumb[data-cnt]').off()
    document.body.addEventListener('mouseover', (e) => {
        if (!e.target.tagName === 'IMG' || !e.target.classList.contains('thumb') || !e.target.getAttribute('src')) return;
        const origin = e.target.src;
        const count = parseInt(e.target.getAttribute('data-cnt')) || 5;
        tick.start(
            () => { e.target.src = rotateImg(e.target.src, count); },
            () => { e.target.src = origin; });
        e.target.closest('.item').addEventListener('mouseleave', () => tick.stop(), { once: true });
    });
}

//====================================================================================================

function downloader() {
    if (!/^\/videos\/\d+\//.test(location.pathname)) return;
    function helper() {
        waitForElementExists(document.body, 'video', (video) => {
            const url = video.getAttribute('src');
            const name = document.querySelector('.headline').innerText + '.mp4';
            GM_download({
                url,
                name,
                saveAs: true,
                onprogress: (e) => {
                    const p = 100 * (e.loaded/e.total);
                    btn.children().css('background', `linear-gradient(90deg, #636f5d, transparent ${p}%)`);
                }
            });
        });
    }

    const btn = unsafeWindow.$('<li><a href="#tab_comments" class="toggle-button" style="text-decoration: none;">download 📼</a></li>');
    unsafeWindow.$('.tabs-menu > ul').append(btn);
    btn.on('click', helper);
}

unsafeWindow.$(document).ready(downloader);

//====================================================================================================

const SCROLL_RESET_DELAY = 500;

const defaultState = new DefaultState(true);
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

function route() {
    if (RULES.PAGINATION) {
        const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    }

    if (RULES.HAS_VIDEOS) {
        const containers = getAllUniqueParents(RULES.GET_THUMBS(document.body));
        containers.forEach(c => handleLoadedHTML(c, c));
        const ui = new VueUI(state, stateLocale, true);
        animate();
    }
}

route();
console.log(LOGO);

// since script cannot be reloaded and scroll params need to be reset according to site options
function shouldReload() {
    const sortContainer = document.querySelector('.sort');
    if (!sortContainer) return;
    watchDomChangesWithThrottle(sortContainer, () => window.location.reload(), 1000);
}
shouldReload();

