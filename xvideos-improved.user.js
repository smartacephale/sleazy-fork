// ==UserScript==
// @name         XVideos Improved
// @namespace    http://tampermonkey.net/
// @version      3.0.1
// @license      MIT
// @description  Infinite scroll. Filter by duration, include/exclude phrases
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.xvideos.com/*
// @exclude      https://*.xvideos.com/embedframe/*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.4/dist/jabroni-outfit.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos.com
// @downloadURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494005/XVideos%20Improved.meta.js
// ==/UserScript==

const { DataManager, createInfiniteScroller, sanitizeStr, timeToSeconds, parseDom, getPaginationStrategy } = window.bhutils;
const { JabroniOutfitStore, defaultStateWithDuration, JabroniOutfitUI } = window.jabronioutfit;

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
  container = document.querySelector('#content')?.firstElementChild;
  HAS_VIDEOS = !!document.querySelector('div.thumb-block[id^=video_]');

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '#main .pagination:last-child',
    searchParamSelector: 'p'
  });

  getThumbs(html) { return html.querySelectorAll('div.thumb-block[id^=video_]:not(.thumb-ad)'); }

  getThumbImgData() { return ({}); };

  getThumbUrl(thumb) { return thumb.querySelector('.title a').innerText; }

  getThumbData(thumb) {
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

  RULES.container.addEventListener('mouseover', handleThumbHover);
}

//====================================================================================================

function route() {
  if (RULES.paginationStrategy.hasPagination) {
    createInfiniteScroller(store, parseData, RULES);
  }

  if (RULES.HAS_VIDEOS) {
    animate();
    parseData(RULES.container)
    new JabroniOutfitUI(store);
  }
}

//====================================================================================================

console.log(LOGO);

const store = new JabroniOutfitStore(defaultStateWithDuration);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
