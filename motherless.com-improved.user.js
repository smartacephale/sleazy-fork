// ==UserScript==
// @name         Motherless.com Improved
// @namespace    http://tampermonkey.net/
// @version      4.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration and key phrases. Download button fixed. Reveal all related galleries to video at desktop. Galleries and tags url rewritten and redirected to video/image section if available.
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://motherless.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=motherless.com
// @grant        unsafeWindow
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.0/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/492238/Motherlesscom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/492238/Motherlesscom%20Improved.meta.js
// ==/UserScript==
/* globals $ */

const {
  fetchWith,
  timeToSeconds,
  replaceElementTag,
  sanitizeStr,
  getAllUniqueParents,
  DataManager,
  createInfiniteScroller,
  getPaginationStrategy
} = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

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

unsafeWindow.__is_premium = true;

class MOTHERLESS_RULES {
  IS_SEARCH = /^\/term\//.test(location.pathname);
  container = [...document.querySelectorAll('.content-inner')].pop();

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.pagination_link, .ml-pagination'
  });

  getThumbs(html) {
    return html.querySelectorAll('.thumb-container, .mobile-thumb');
  }

  getThumbUrl(thumb) {
    return thumb.querySelector('a').href;
  }

  getThumbData(thumb) {
    const uploader = sanitizeStr(thumb.querySelector('.uploader')?.innerText);
    const title = sanitizeStr(thumb.querySelector('.title')?.innerText).concat(` user:${uploader}`);
    const duration = timeToSeconds(thumb.querySelector('.size')?.innerText);
    return { title, duration };
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('.static');
    const imgSrc = img.getAttribute('src');
    return { img, imgSrc };
  }
}

const RULES = new MOTHERLESS_RULES();

//====================================================================================================

function animate() {
  $(RULES.CONTAINER).find('a, div, span, ul, li, p, button').off();
  const ANIMATION_INTERVAL = 500;
  const tick = new window.bhutils.Tick(ANIMATION_INTERVAL);
  let container;

  function handleLeave(e) {
    tick.stop();
    const preview = e.target.className.includes('desktop')
      ? e.target.querySelector('.static')
      : e.target.classList.contains('static')
        ? e.target
        : undefined;
    $(preview.nextElementSibling).hide();
    preview.classList.remove('animating');
  }

  function handleOn(e) {
    const { target, type } = e;
    if (
      !(target.tagName === 'IMG' && target.classList.contains('static')) ||
      target.classList.contains('animating') ||
      target.parentElement.parentElement.classList.contains('image') ||
      target.getAttribute('src') === target.getAttribute('data-strip-src')
    )
      return;
    target.classList.toggle('animating');

    container = target.parentElement.parentElement;
    const eventType = type === 'mouseover' ? 'mouseleave' : 'touchend';
    container.addEventListener(eventType, handleLeave, { once: true });

    let j = 0;
    const d = $(container.querySelector('.img-container'));
    const m = $(
      target.nextElementSibling ||
      '<div style="z-index: 8; position: absolute; top: -11px;"></div>',
    );
    if (!target.nextElementSibling) {
      $(target.parentElement).append(m);
    }
    const c = $(target);
    const stripSrc = target.getAttribute('data-strip-src');
    m.show();

    tick.start(() => {
      const widthRatio = Math.floor((1000.303 * c.width()) / 100);
      const heightRatio = Math.floor((228.6666 * c.height()) / 100);

      m.css({
        width: d.width(),
        height: c.height(),
        'background-image': `url('${stripSrc}')`,
        'background-size': `${widthRatio}px ${heightRatio}px`,
        'background-position': `${(j++ * d.width()) % widthRatio}px 0`,
      });
    });
  }

  document.body.addEventListener('mouseover', handleOn);
  document.body.addEventListener('touchstart', handleOn);
}

//====================================================================================================

function fixURLs() {
  document.querySelector('a[href^="https://motherless.com/random/image"]').href =
    'https://motherless.com/m/calypso_jim_asi';
  document.querySelectorAll('.gallery-container').forEach((g) => {
    const hasVideos = parseInt(g.innerText.match(/([\d|.]+)k? videos/gi)?.[0]) > 0;
    const header = hasVideos ? '/GV' : '/GI';
    g.querySelectorAll('a').forEach((a) => {
      a.href = a.href.replace(/\/G/, () => header);
    });
  });
  document.querySelectorAll('a[href^="/term/"]:not([href^="/term/videos/"])').forEach((a) => {
    a.href = a.href.replace(/[\w|+]+$/, (v) => `videos/${v}?term=${v}&range=0&size=0&sort=date`);
  });
  document.querySelectorAll('#media-groups-container a[href^="/g/"]').forEach((a) => {
    a.href = a.href.replace(/\/g\//, '/gv/');
  });
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

function applySearchFilters() {
  let pathname = window.location.pathname;
  const wordsToFilter =
    store.state.filterExcludeWords.replace(/f:/g, '').match(/(?<!user:)\b\w+\b(?!\s*:)/g) || [];
  wordsToFilter
    .filter((w) => !pathname.includes(w))
    .forEach((w) => {
      pathname += `+-${w.trim()}`;
    });
  if (wordsToFilter.some((w) => !window.location.href.includes(w))) {
    window.location.href = pathname;
  }
}

//====================================================================================================

function route() {
  desktopAddMobGalleries().then(() => fixURLs());

  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
    animate();
  }

  if (RULES.getThumbs(document.body).length > 0) {
    new JabroniOutfitUI(store);
    getAllUniqueParents(RULES.getThumbs(document.body)).forEach((c) => {
      parseData(c, c, true);
    });
  }

  if (RULES.IS_SEARCH) {
    applySearchFilters();
  }
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
