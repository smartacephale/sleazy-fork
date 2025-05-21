// ==UserScript==
// @name         SpankBang.com Improved
// @namespace    http://tampermonkey.net/
// @version      2.1.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.spankbang.com/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.1/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spankbang.com
// @downloadURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/493946/SpankBangcom%20Improved.meta.js
// ==/UserScript==

const { getAllUniqueParents, timeToSeconds, parseDom, sanitizeStr, DataManager, InfiniteScroller } = window.bhutils;
Object.assign(unsafeWindow, { bhutils: window.bhutils });
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
    delay = 300;

    constructor() {
        this.IS_VIDEO_PAGE = /^\/\w+\/video\//.test(location.pathname);
        this.IS_SEARCH_PAGE = location.pathname.startsWith('/s/');
        this.paginationElement = document.querySelector('.paginate-bar, .pagination');
        this.paginationLast = parseInt(
            document.querySelector('.paginate-bar .status span')?.innerText.match(/\d+/)?.[0] ||
            Array.from(document.querySelectorAll('.pagination a'))?.at(-2)?.innerText);
        Object.assign(this, this.URL_DATA());
        this.CONTAINER = document.querySelectorAll('.results .video-list')[0];
        this.HAS_VIDEOS = !!this.GET_THUMBS(document.body).length > 0;
    }

    GET_THUMBS(html) {
        return Array.from(html.querySelectorAll('.video-item:not(.clear-fix), .js-video-item') || []);
    }

    THUMB_URL(thumb) {
        return thumb.querySelector('a[title]').href;
    }

    THUMB_IMG_DATA(thumb) {
        const img = thumb.querySelector('img');
        const imgSrc = img.getAttribute('data-src');
        img.removeAttribute('data-src');
        return { img, imgSrc };
    }

    THUMB_DATA(thumb) {
        const title = sanitizeStr(thumb.querySelector('[title]')?.getAttribute('title'));
        const duration = timeToSeconds(thumb.querySelector('span.l')?.innerText);
        return { title, duration };
    }

    URL_DATA() {
        const url = new URL(window.location.href);
        const paginationOffset = parseInt(url.pathname.match(/\/(\d+)\/?$/)?.pop()) || 1;
        if (!/\/\d+\/$/.test(url.pathname)) url.pathname = `${url.pathname}/${paginationOffset}/`;

        const paginationUrlGenerator = n => {
            url.pathname = url.pathname.replace(/\/\d+\/$/, `/${n}/`);
            return url.href;
        };

        return { paginationOffset, paginationUrlGenerator };
    }
}

const RULES = new SPANKBANG_RULES();

//====================================================================================================

function createPreviewElement(src, mount) {
    const elem = parseDom(`
      <div class="video-js vjs-controls-disabled vjs-touch-enabled vjs-workinghover vjs-v7 vjs-playing vjs-has-started
        mp4t_video-dimensions vjs-user-inactive" id="mp4t_video" tabindex="-1" lang="en" translate="no" role="region" aria-label="Video Player" style="opacity: 1;">
        <video id="mp4t_video_html5_api" class="vjs-tech" tabindex="-1" muted="muted" playsinline="playsinline" autoplay="autoplay" src="${src}"></video>
        <div class="vjs-poster vjs-hidden" tabindex="-1" aria-disabled="false"></div>
        <div class="vjs-text-track-display" translate="yes" aria-live="off" aria-atomic="true">
          <div style="position: absolute; inset: 0px; margin: 1.5%;"></div>
        </div>
      </div>>`);
    mount.append(elem);
    const removeElem = () => { elem.remove(); }
    return { removeElem };
}

function animate() {
    document.querySelectorAll('.video-rotate').forEach(e => e.classList.remove('.video-rotate'));
    function handleThumbHover(e) {
        if (!e.target.getAttribute('data-preview')) return;
        const parent = e.target.parentElement.parentElement;
        const videoSrc = e.target.getAttribute('data-preview');
        const { removeElem } = createPreviewElement(videoSrc, parent);
        parent.addEventListener('mouseleave', removeElem, { once: true });
    }
  document.body.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function unmute(tries = 10) {
  const muteButton = document.querySelector('.vjs-mute-control');
  if (!muteButton) {
    if (tries > 0) setTimeout(() => unmute(--tries), 500);
    return;
  }

  if (muteButton.getAttribute('title') === 'Unmute') {
    muteButton.click();
  }

  const observer = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'title' && muteButton.getAttribute('title') === 'Unmute') {
              muteButton.click();
          }
      }
  });
  observer.observe(muteButton, { attributes: true });
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
    if (RULES.IS_SEARCH_PAGE) {
        [...document.querySelectorAll('.main_results .main_content_container')].slice(1).forEach(c => {
            if (c.querySelector('.video-list, a.go, h2.main_content_title, .channels_scroll_list')) c.remove()
        });
    }

    if (RULES.HAS_VIDEOS) {
        animate();
        new JabroniOutfitUI(store);
        getAllUniqueParents(RULES.GET_THUMBS(document.body)).forEach(c => handleLoadedHTML(c, c));
    }

    if (RULES.paginationElement) {
        createInfiniteScroller();
    }

    if (RULES.IS_VIDEO_PAGE) unmute();
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);
route();
