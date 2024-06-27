// ==UserScript==
// @name         Motherless.com Improved
// @namespace    http://tampermonkey.net/
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @license      MIT
// @version      2.3.5
// @description  Infinite scroll (optional). Filter by duration and key phrases. Reveal all related galleries to video at desktop. Galleries and tags url rewritten and redirected to video/image section if available
// @match        https://motherless.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=motherless.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://unpkg.com/vue@3.4.21/dist/vue.global.prod.js
// @require      https://update.greasyfork.org/scripts/494206/utils.user.js
// @require      data:, let tempVue = unsafeWindow.Vue; unsafeWindow.Vue = Vue; const { ref, watch, reactive, createApp } = Vue;
// @require      https://update.greasyfork.org/scripts/494207/persistent-state.user.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js
// @require      https://update.greasyfork.org/scripts/494205/pagination-manager.user.js
// @require      https://update.greasyfork.org/scripts/494203/vue-ui.user.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/492238/Motherlesscom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/492238/Motherlesscom%20Improved.meta.js
// ==/UserScript==
/* globals Tick fetchMobHtml replaceElementTag timeToSeconds DefaultState DataManager PaginationManager VueUI getAllUniqueParents */

const LOGO = `
⡿⣹⡝⣯⡝⣯⡝⣯⠽⣭⢻⣭⢻⣭⢻⣭⢻⡭⢯⡽⡭⢏⡳⣍⡛⡜⡍⢎⡱⢊⠖⡱⢊⡖⣱⢊⠶⡱⢎⠶⣩⣿⢣⠝⣺⢿⣹⣷⣿⣿⣿⣿⢠⢃⠦⡑⢢⠜⣐⠢
⣟⡧⣟⢮⡽⣖⣻⢼⡻⣜⣳⢎⡷⣎⠷⣎⠷⣙⢧⡚⣥⢋⠶⣡⠞⣱⡘⣣⠱⣋⠼⡱⣉⠶⣡⡛⡼⣱⢫⡝⣶⣯⣏⢞⡥⢫⣝⣯⣟⣾⣿⣽⢂⠣⣌⡑⢣⡘⠤⣃
⣞⡷⣭⢟⡾⣹⢮⢷⣹⢧⣛⠮⣕⢎⡳⢬⠳⣍⠶⣙⢦⢋⡞⣥⢚⡥⣚⠴⣙⢦⠳⣥⢣⣛⡴⣯⢵⣣⢷⣹⣿⡷⣽⣎⣿⣧⢿⣯⣿⡿⣾⠏⢆⡓⢤⡉⢖⡨⡑⢆
⣷⡽⣺⣝⠾⣭⣛⣮⢷⣫⡽⣛⡼⣫⡝⣧⢻⣬⢳⢭⡲⣍⠶⣡⠏⡶⣹⡞⣵⢮⣟⡶⣯⣛⣾⡽⣷⡹⢎⣿⣿⣽⣷⣿⢿⣼⣻⣿⣿⢿⠏⡜⢢⢍⡒⠜⡢⡑⡜⢂
⡵⣹⠳⣞⣻⢧⠿⣜⣧⢯⣷⣯⢷⣳⣽⣚⠷⣎⡟⣮⢳⣎⢷⣣⣛⡴⢣⡜⣩⠝⣚⠿⡹⢭⢏⡿⣶⡹⡭⣿⣯⣿⣿⠿⣛⠻⢿⣿⣿⣿⡘⣌⢣⠒⣌⢣⠱⡑⣌⠣
⢫⡵⣛⡼⢣⡟⣯⢻⡼⢳⢮⡛⢿⢳⣟⡾⣯⢷⣹⣎⠷⣎⢧⡳⣍⡞⢧⡛⣖⢫⡜⢶⡱⣍⢮⡜⣡⢍⡱⣛⢭⡱⢦⡳⢬⣙⠶⣘⡛⢷⡘⢤⠣⢍⢆⢣⢣⠱⣌⠲
⣟⡴⣣⡝⢧⡝⢮⣛⡜⣣⢎⡽⣌⠧⣎⡹⢫⠿⣳⣯⣟⡾⣧⢷⣺⡜⣧⡽⣬⢳⠜⣣⠚⣌⠱⡌⡱⢊⠥⣉⠞⡹⢿⡝⢦⣽⢢⠅⣏⠻⡜⢢⡙⡌⢎⢆⢣⠓⠤⠓
⣯⣝⡳⣎⣗⡚⢧⡳⣜⡱⣎⠶⣭⢞⡶⠽⠧⠟⡶⢭⣻⡽⣯⣟⣳⣟⡷⢫⡱⣃⠞⡤⢋⠤⡓⢬⡑⣎⠶⣱⢮⡱⣣⣞⡧⣛⣬⣳⡌⢣⢍⠢⡑⢌⠢⠌⡂⠜⢠⠃
⡷⣎⢷⡹⣎⢿⣹⠷⣜⡱⣭⢟⡎⡞⡴⣉⠎⡵⡘⢦⢡⠹⣑⡛⢬⡳⣜⢣⠳⣥⢋⠶⣉⢖⣩⢒⡹⢌⠯⡝⢶⡿⣣⣗⡷⡽⣞⣳⣭⣳⠌⢆⡑⢢⠘⡄⠱⡈⢄⠂
⡿⣜⢧⡻⣜⢧⡻⣝⣮⢷⡘⢯⡜⡱⢜⢢⡙⠴⣉⢆⢣⡙⣤⠛⢦⣛⡬⢏⡷⢪⡝⢮⡱⢎⢆⠧⣘⠬⡒⣍⢲⡙⢷⣸⢞⡷⣯⡟⣯⢳⡿⢂⠜⡠⢃⠌⡱⠐⡌⢂
⣷⡹⣎⢷⡹⢎⣽⣋⢯⡹⣜⢣⡜⡱⢊⠦⡙⢦⡑⢎⠦⡱⢆⡛⢦⣛⡼⣫⢞⣧⣛⢮⡵⣋⠞⣬⢱⡊⡵⡘⢦⡙⠦⣍⢚⡼⣱⢏⡟⣫⢆⠱⡨⢐⠡⢊⠔⡡⠘⡄
⣳⢧⢻⡼⣳⡭⢶⡹⢮⡕⣎⠧⢎⡵⣉⠖⡩⢆⡹⢌⠶⣙⢬⡙⣦⢣⡟⣵⢯⣶⣛⡞⡶⣭⣛⡴⢣⠳⣥⠛⡴⣩⢓⢬⢚⡜⢣⢏⠼⣡⢎⡱⢢⢍⢢⠁⢎⠰⡁⠆
⡿⣜⣣⣽⢗⡻⢳⣹⢣⢞⡬⢳⣩⠒⣥⢚⡱⢊⡴⢋⡼⣘⢦⢻⡴⣻⣼⢯⡿⣾⡽⣹⡗⣧⢯⣜⢯⡳⣬⣛⡴⢣⢏⡞⡜⣬⢃⢎⠳⣌⢮⡱⢃⡎⢦⡙⢦⠑⡌⣂
⣾⡰⢧⣟⢮⢵⣫⢖⡏⣞⡜⣣⢖⡹⢤⠳⣘⢇⡞⡱⢎⡵⣋⢷⣹⢳⣞⣻⢽⣳⣟⣷⣻⡽⣞⡽⣎⢷⡳⣎⢷⢫⡞⡼⡱⢆⡫⣌⠳⡜⢦⡝⢣⠞⣢⡙⢆⢣⠒⡌
⣗⣯⡷⣹⢮⡳⣎⢷⡹⣎⡼⡱⢎⡵⣊⠷⣩⠞⡼⣱⢫⢶⡹⣎⢷⣫⢾⣭⢿⣳⣟⣾⣳⢿⡽⣯⡽⣣⢟⡼⣋⡧⣝⠶⣙⢮⡑⣎⢳⡙⣦⠍⣇⢫⠴⣙⠬⡒⢩⡐
⣿⢾⣟⡯⢷⣝⡮⢷⣹⢶⣙⢧⡻⣴⢋⡞⣥⢻⡜⣧⣛⣮⢷⣫⢷⣫⣟⡾⣯⢷⣞⡷⣿⣟⣿⣣⢟⡽⣎⢷⡹⢎⣧⢛⡜⡦⡝⣬⢣⡝⢦⢋⡔⢣⠚⡄⠓⡌⢅⠂
⣿⣻⡼⡽⣏⡾⣝⡿⣜⣧⢻⣎⡷⣭⡻⣜⣳⣏⣾⣳⡽⣞⣯⣳⢯⢶⣯⣽⣯⣟⣾⣻⣿⡽⣶⣛⢮⢳⡎⢷⣩⢏⠶⣩⢞⣱⡙⡦⢏⡼⣋⠖⣌⠣⢍⠢⡑⢌⣂⠣
⣷⣳⡽⣽⣫⣽⣻⣼⣻⣼⣻⢞⡷⣯⡽⣯⢷⣞⡷⣯⢿⣽⣞⡷⣯⣟⣾⣽⣾⣻⣾⣿⢯⣟⢶⡹⣎⣗⢺⢣⡞⡼⣩⣓⢮⢲⣍⡳⢏⡞⣥⢋⠤⢋⠬⡱⡘⠔⠢⡅
⣷⣻⢞⣷⣛⡾⣵⣳⣟⡾⣽⢯⣟⣷⣻⣽⣻⢾⣽⣟⣿⣻⣾⣿⣟⣾⣿⣽⣷⣿⣻⣯⣟⢮⡳⣝⠶⣪⢭⣓⢮⠵⡳⡜⣮⠳⣜⡝⣮⡝⡦⢽⣅⢋⢆⠱⣈⢎⡱⢄
⣷⢯⣟⡾⣽⣻⢷⣻⢾⡽⣯⣟⣾⣳⢟⡾⣽⣻⢾⡽⣞⡿⣽⣿⣿⣿⣾⣿⣯⣿⣿⣳⢏⡷⣝⢮⣛⣥⢳⣎⣏⢾⡱⣛⡴⡻⣜⡞⣵⢺⢩⠃⢏⡸⢌⢒⡡⢂⠖⣈
⣯⣟⡾⣽⣳⢯⡿⣽⢯⣟⣷⢻⣞⣭⢿⣹⠶⣏⡿⣽⢯⣟⡿⣿⣿⣿⣿⣿⣿⣿⢷⣯⣛⢾⡹⣎⠷⣎⢷⡺⣜⢧⣛⣥⢻⡵⣣⢟⡼⣋⠦⡙⠰⢂⠎⠢⠔⡡⢊⠄
⡿⣽⣻⢷⣯⠿⣽⣳⣟⡾⣞⠿⣼⢎⡷⣭⢻⡞⣽⣳⣟⡾⣿⣿⣿⣿⣽⡷⢾⣽⣻⢶⣫⣗⣻⣜⡻⣜⢧⡻⣜⢧⡻⣜⡳⣞⡵⣫⢞⣥⣶⣷⣿⣶⣿⣿⣿⣿⣿⣿`;


class MOTHERLESS_RULES {
    GALLERY_TAG = '.gallery-container';
    GALLERY_MOB_TAG = '.ml-gallery-thumb';

    GROUP_TAG = '.group-minibio';

    constructor() {
        this.PAGINATION = document.querySelector('.pagination_link');
        this.PAGINATION_LAST = parseInt(document.querySelector('.pagination_link a:last-child')?.previousSibling.innerText);
        this.CONTAINER = document.querySelector('.content-inner');
    }

    GET_THUMBS(html) { return html.querySelectorAll('.thumb-container'); }

    THUMB_URL(thumb) { return thumb.firstElementChild.getAttribute('data-codename'); };

    THUMB_DATA(thumb) {
        const uploader = (thumb.querySelector('.uploader')?.innerText || "").toLowerCase();
        const title = (thumb.querySelector('.title')?.innerText || "").toLowerCase();
        const duration = timeToSeconds(thumb.querySelector('.size')?.innerText || "0");
        return {
            title: `${title} ${uploader}`,
            duration
        }
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('.static');
        return { img, imgSrc: img.getAttribute('src') };
    }

    URL_DATA() {
        const { origin, pathname, search, href } = window.location;
        const url = new URL(href);

        const offset = parseInt(url.searchParams.get('page')) || 1;
        const iteratable_url = (n) => {
            url.searchParams.set('page', n);
            return url.href;
        }

        return {
            offset,
            iteratable_url
        }
    }
}

const RULES = new MOTHERLESS_RULES();

//====================================================================================================

function animate() {
    unsafeWindow.$("a, div, span, ul, li, p, button").off();

    const ANIMATION_INTERVAL = 500;
    const tick = new Tick(ANIMATION_INTERVAL);
    let container;

    function handleLeave(e) {
        tick.stop();
        const preview = e.target.querySelector('.static');
        unsafeWindow.$(preview.nextElementSibling).hide();
        preview.classList.remove('animating');
    }

    document.body.addEventListener('mouseover', (e) => {
        if (!(e.target.tagName === 'IMG' && e.target.classList.contains('static')) ||
            e.target.classList.contains('animating') ||
            e.target.getAttribute('src') === e.target.getAttribute('data-strip-src')) return;

        e.target.classList.toggle('animating');

        container = e.target.parentElement.parentElement;
        container.addEventListener('mouseleave', handleLeave, {once: true});

        let j = 0;
        const d = unsafeWindow.$(container.querySelector('.img-container'));

        const m = unsafeWindow.$(e.target.nextElementSibling || '<div style="z-index: 8; position: absolute; top: -11px;"></div>');
        if (!e.target.nextElementSibling) {
            unsafeWindow.$(e.target.parentElement).append(m);
        }

        const c = unsafeWindow.$(e.target);
        const h = e.target.getAttribute('data-strip-src');
        m.show();

        tick.start(() => {
            const v = Math.floor(1000.303 * c.width() / 100);
            const k = Math.floor(228.6666 * c.height() / 100);
            m.css("width", d.width());
            m.css("height", c.height());
            m.css("background-image", "url('" + h + "')");
            m.css("background-size", v + "px " + k + "px ");
            j * d.width() > v && (j = 0);
            m.css("background-position", j * d.width() + "px 0");
            j++;
        })
    });
}

//====================================================================================================

function fixGalleriesURLs() {
    const galleries = Array.from(document.querySelectorAll(('.gallery-container .info span:first-child')));
    galleries.forEach(s => {
        const videosCount = parseInt(s.innerText);
        const header = videosCount > 0 ? '/GV' : '/GI';
        const href = s.parentElement.parentElement.href.replace(/\/G/, () => header);
        s.parentElement.parentElement.href = href;
        s.parentElement.parentElement.parentElement.previousElementSibling.href = href;
    });
}

function fixHrefs() {
    document.querySelectorAll('a[href^="/term/"]').forEach(a => {
        a.href = a.href.replace(/[\w|+]+$/, (v) => `videos/${v}?term=${v}&range=0&size=0&sort=date`);
    });
}

//====================================================================================================

function displayAll() {
    unsafeWindow.$(RULES.GROUP_TAG).attr('style', 'display: block !important');
    unsafeWindow.$(RULES.GALLERY_TAG).attr('style', 'display: block !important');
}

function mobileGalleryToDesktop(e) {
    e.firstElementChild.nextElementSibling.nextElementSibling.remove();
    e.firstElementChild.appendChild(e.firstElementChild.nextElementSibling);
    e.className = 'thumb-container gallery-container';
    e.firstElementChild.className = 'desktop-thumb image medium';
    e.firstElementChild.firstElementChild.nextElementSibling.className = 'gallery-captions';
    replaceElementTag(e.firstElementChild.firstElementChild, 'a');
}

async function desktopAddMobGalleries() {
    const galleries = document.querySelector('.media-related-galleries');
    if (galleries) {
        const galleriesContainer = galleries.firstElementChild.nextElementSibling.firstElementChild;
        const galleriesCount = galleries.querySelectorAll(RULES.GALLERY_TAG).length;
        const mobDom = await fetchMobHtml(window.location.href);
        const mobGalleries = mobDom.querySelectorAll(RULES.GALLERY_MOB_TAG);
        for (const [i, x] of mobGalleries.entries()) {
            if (i > galleriesCount - 1) {
                mobileGalleryToDesktop(x);
                galleriesContainer.appendChild(x);
            }
        }
        displayAll();
    }
}

//====================================================================================================

GM_addStyle('.img-container, .desktop-thumb { min-height: 150px; max-height: 150px; }');

GM_addStyle(`
@media only screen and (max-width: 1280px) {
  #categories-page.inner .filtered-duration { display: none !important; }
  #categories-page.inner .filtered-exclude { display: none !important; }
  #categories-page.inner .filtered-include { display: none !important; }
}`);

//====================================================================================================

const SCROLL_RESET_DELAY = 50;

console.log(LOGO);

const defaultState = new DefaultState();
const { state, stateLocale } = defaultState;
const { filter_, handleLoadedHTML } = new DataManager(RULES, state);
defaultState.setWatchers(filter_);

desktopAddMobGalleries().then(() => fixGalleriesURLs());

if (RULES.PAGINATION) {
    const paginationManager = new PaginationManager(state, stateLocale, RULES, handleLoadedHTML, SCROLL_RESET_DELAY);
    animate();
}

if (RULES.GET_THUMBS(document.body).length > 0) {
    const ui = new VueUI(state, stateLocale);
    getAllUniqueParents(document.querySelectorAll('.thumb-container')).forEach(c => {
        handleLoadedHTML(c, c);
    });
}

fixHrefs();
