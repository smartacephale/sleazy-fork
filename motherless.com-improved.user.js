// ==UserScript==
// @name         Motherless.com Improved
// @namespace    http://tampermonkey.net/
// @version      3.1.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration and key phrases. Download button fixed. Reveal all related galleries to video at desktop. Galleries and tags url rewritten and redirected to video/image section if available
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://motherless.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=motherless.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.1/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/492238/Motherlesscom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/492238/Motherlesscom%20Improved.meta.js
// ==/UserScript==
/* globals $ */

const { Tick, fetchWith, timeToSeconds, replaceElementTag, isMob, sanitizeStr, getAllUniqueParents, DataManager, InfiniteScroller } = window.bhutils;
Object.assign(unsafeWindow, { bhutils: window.bhutils });
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI, DefaultScheme } = window.jabronioutfit;

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

// Enable internal downloader
unsafeWindow.__is_premium = true;

class UNIVERSAL_RULES {
  static parsePagination(document) {
    const paginations = document.querySelectorAll('.pagination');
    return Array.from(paginations).pop();
  }

  static parsePaginationLast(pagination) {
    const el = pagination.querySelector('.last-page');
    return parseInt(el.innerText) || 1;
  }

  static parseThumbData(thumb, thumbCallback) {
    const uploader = bhutils.sanitizeStr(thumb.querySelector('[class*=name], .uploader')?.innerText);
    let title = bhutils.sanitizeStr(
      thumb.querySelector('[title]')?.getAttribute('title') ||
      thumb.querySelector('[class*=title], header')?.innerText);
    let duration = bhutils.sanitizeStr(thumb.querySelector('[class*=duration], .size')?.innerText);

    if (uploader && title !== uploader) {
      title = title.concat(` user:${uploader}`);
    }

    duration = bhutils.timeToSeconds(duration);

    if (thumbCallback) {
      thumbCallback();
    }

    return { title, duration }
  }
}

class MOTHERLESS_RULES {
    delay = 50;

    constructor() {
        const url = new URL(window.location.href);

        this.paginationOffset = parseInt(url.searchParams.get('page')) || 1;
        this.paginationUrlGenerator = (n) => {
            url.searchParams.set('page', n);
            return url.href;
        }

        this.paginationElement = document.querySelector('.pagination_link, .ml-pagination');
        this.paginationLast = parseInt(
            document.querySelector('.pagination_link a:last-child')?.previousSibling.innerText.replace(',', '') ||
            document.querySelector('.ml-pagination li:last-child')?.innerText.replace(',', '')
        );

        this.CONTAINER = Array.from(document.querySelectorAll('.content-inner')).pop();
        this.IS_SEARCH = /^\/term\//.test(window.location.pathname);
    }

    GET_THUMBS(html) { return html.querySelectorAll('.thumb-container, .mobile-thumb'); }

    THUMB_URL(thumb) { return thumb.querySelector('.img-container').href; };

    THUMB_DATA(thumb) { return UNIVERSAL_RULES.parseThumbData(thumb); }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('.static');
        return { img, imgSrc: img.getAttribute('src') };
    }
}

const RULES = new MOTHERLESS_RULES();

//====================================================================================================

function animate() {
    $(RULES.CONTAINER).find("a, div, span, ul, li, p, button").off();
    const ANIMATION_INTERVAL = 500;
    const tick = new Tick(ANIMATION_INTERVAL);
    let container;

    function handleLeave(e) {
        tick.stop();
        const preview = e.target.className.includes('desktop') ? e.target.querySelector('.static') :
            (e.target.classList.contains('static') ? e.target : undefined);
        $(preview.nextElementSibling).hide();
        preview.classList.remove('animating');
    }

    function handleOn(e) {
        const { target, type } = e;
        if (!(target.tagName === 'IMG' && target.classList.contains('static')) ||
            target.classList.contains('animating') ||
            target.parentElement.parentElement.classList.contains('image') ||
            target.getAttribute('src') === target.getAttribute('data-strip-src')) return;
        target.classList.toggle('animating');

        container = target.parentElement.parentElement;
        container.addEventListener(type === 'mouseover' ? 'mouseleave' : 'touchend', handleLeave, { once: true });

        let j = 0;
        const d = $(container.querySelector('.img-container'));
        const m = $(target.nextElementSibling || '<div style="z-index: 8; position: absolute; top: -11px;"></div>');
        if (!target.nextElementSibling) {
            $(target.parentElement).append(m);
        }
        const c = $(target);
        const stripSrc = target.getAttribute('data-strip-src');
        m.show();

        tick.start(() => {
            const widthRatio = Math.floor(1000.303 * c.width() / 100);
            const heightRatio = Math.floor(228.6666 * c.height() / 100);

            m.css({
                width: d.width(),
                height: c.height(),
                "background-image": `url('${stripSrc}')`,
                "background-size": `${widthRatio}px ${heightRatio}px`,
                "background-position": `${(j++ * d.width()) % widthRatio}px 0`
            });
        });
    }

    document.body.addEventListener('mouseover', handleOn);
    document.body.addEventListener('touchstart', handleOn);
}

//====================================================================================================

function fixURLs() {
    document.querySelector('a[href^="https://motherless.com/random/image"]').href = "https://motherless.com/m/calypso_jim_asi";
    document.querySelectorAll(('.gallery-container')).forEach(g => {
        const hasVideos = parseInt(g.innerText.match(/([\d|\.]+)k? videos/gi)?.[0]) > 0;
        const header = hasVideos ? '/GV' : '/GI';
        g.querySelectorAll('a').forEach(a => { a.href = a.href.replace(/\/G/, () => header); });
    });
    document.querySelectorAll('a[href^="/term/"]').forEach(a => {
        a.href = a.href.replace(/[\w|+]+$/, (v) => `videos/${v}?term=${v}&range=0&size=0&sort=date`);
    });
    document.querySelectorAll('#media-groups-container a[href^="/g/"]').forEach(a => { a.href = a.href.replace(/\/g\//, '/gv/') });
}

//====================================================================================================

function mobileGalleryToDesktop(e) {
    e.querySelector('.clear-left').remove();
    e.firstElementChild.appendChild(e.firstElementChild.nextElementSibling);
    e.className = 'thumb-container gallery-container';
    e.firstElementChild.className = 'desktop-thumb image medium';
    e.firstElementChild.firstElementChild.nextElementSibling.className = 'gallery-captions';
    replaceElementTag(e.firstElementChild.firstElementChild, 'a');
    return e;
}

async function desktopAddMobGalleries() {
    const galleries = document.querySelector('.media-related-galleries');
    if (galleries) {
        const galleriesContainer = galleries.querySelector('.content-inner');
        const galleriesCount = galleries.querySelectorAll('.gallery-container').length;
        const mobDom = await fetchWith(window.location.href, { html: true, mobile: true });
        const mobGalleries = mobDom.querySelectorAll('.ml-gallery-thumb');
        for (const [i, x] of mobGalleries.entries()) {
            if (i > galleriesCount - 1) {
                galleriesContainer.append(mobileGalleryToDesktop(x));
            }
        }
    }
}

//====================================================================================================

GM_addStyle(`
.img-container, .desktop-thumb { min-height: 150px; max-height: 150px; }

.group-minibio, .gallery-container { display: block !important; }

@media only screen and (max-width: 1280px) {
  #categories-page.inner .filtered-duration { display: none !important; }
  #categories-page.inner .filtered-exclude { display: none !important; }
  #categories-page.inner .filtered-include { display: none !important; }
}

.ml-masonry-images.masonry-columns-4 .content-inner { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.ml-masonry-images.masonry-columns-6 .content-inner { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
.ml-masonry-images.masonry-columns-8 .content-inner { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); }
`);

//====================================================================================================

function useWebsiteSearchFilters() {
    let url = window.location.pathname;
    const wordsToFilter = state.filterExcludeWords.replace(/f\:/g, '')
      .match(/(?<!user:)\b\w+\b(?!\s*:)/g) || [];
    wordsToFilter.forEach(w => {
        if (!url.includes(w)) {
            url += `+-${w.trim()}`;
        }
    });
    if (wordsToFilter.some(w => !window.location.href.includes(w))) {
        window.location.href = url;
    }
}

//====================================================================================================

function createInfiniteScroller() {
  const iscroller = new InfiniteScroller({
    enabled: state.infiniteScrollEnabled,
    handleHtmlCallback: handleLoadedHTML,
    ...RULES,
  }).onScroll(({paginationLast, paginationOffset}) => {
      stateLocale.pagIndexLast = paginationLast;
      stateLocale.pagIndexCur = paginationOffset;
    }, true);

  store.subscribe(() => {
    iscroller.enabled = state.infiniteScrollEnabled;
  });
}

//====================================================================================================

function route() {
  desktopAddMobGalleries().then(() => fixURLs());

  if (RULES.paginationElement) {
      createInfiniteScroller();
      animate();
  }

  if (RULES.GET_THUMBS(document.body).length > 0) {
      new JabroniOutfitUI(store);
      getAllUniqueParents(RULES.GET_THUMBS(document.body)).forEach(c => {
          handleLoadedHTML(c, c, true);
      });
  }

  if (RULES.IS_SEARCH) {
    useWebsiteSearchFilters();
  }
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);
route();
