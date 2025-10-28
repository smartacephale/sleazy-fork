// ==UserScript==
// @name         CamWhores.tv Improved
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @license      MIT
// @description  Infinite scroll (optional). Filter by duration, private/public, include/exclude phrases. Mass friend request button. Download button
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.camwhores.*/*
// @match        https://*.camwhores.tv/*
// @exclude      https://*.camwhores.tv/*mode=async*
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.5/dist/jabroni-outfit.umd.js
// @require      https://cdn.jsdelivr.net/npm/lskdb@1.0.2/dist/lskdb.umd.js
// @run-at       document-idle
// @icon         https://www.google.com/s2/favicons?sz=64&domain=camwhores.tv
// @downloadURL https://update.sleazyfork.org/scripts/494528/CamWhorestv%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/494528/CamWhorestv%20Improved.meta.js
// ==/UserScript==
/* globals $ */

const {
  Tick,
  parseDom,
  fetchHtml,
  AsyncPool,
  wait,
  computeAsyncOneAtTime,
  timeToSeconds,
  circularShift,
  range,
  watchDomChangesWithThrottle,
  objectToFormData,
  getPaginationStrategy,
  sanitizeStr,
  getAllUniqueParents,
  downloader,
  DataManager,
  createInfiniteScroller,
} = window.bhutils;
const {
  JabroniOutfitStore,
  defaultStateWithDurationAndPrivacy,
  JabroniOutfitUI,
  defaultSchemeWithPrivacyFilter,
} = window.jabronioutfit;
const { LSKDB } = window.lskdb;

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

GM_addStyle(`
.item.private .thumb, .item .thumb.private { opacity: 1 !important; }
.haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
.haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
.friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
`);

class CAMWHORES_RULES {
  IS_FAVOURITES = /\/my\/\w+\/videos/.test(location.pathname);
  IS_SUBS = /\/my\/subscriptions/.test(location.pathname);
  IS_MEMBER_PAGE = /\/members\/\d+\/$/.test(location.pathname);
  IS_MINE_MEMBER_PAGE = /\/my\/$/.test(location.pathname);
  IS_MESSAGES = /^\/my\/messages\//.test(location.pathname);
  IS_MEMBER_VIDEOS = /\/members\/\d+\/(favourites\/)?videos/.test(location.pathname);
  IS_COMMUNITY_LIST = /\/members\/$/.test(location.pathname);
  IS_VIDEO_PAGE = /^\/\d+\//.test(location.pathname);
  IS_LOGGED_IN = document.cookie.includes('kt_member');

  paginationStrategy = getPaginationStrategy({
    paginationSelector: '.pagination:not([id *= member])',
    fixPaginationLast: (x) => x === 9 ? 999 : x,
  });

  container = this.getContainer();
  HAS_VIDEOS = !!this.container;

  constructor() {
    if (this.IS_FAVOURITES || this.IS_MEMBER_VIDEOS) {
      const resetContainer = () => {
        this.container = this.getContainer();
      };
      this.INTERSECTION_OBSERVABLE = document.querySelector('.footer');
      watchDomChangesWithThrottle(document.querySelector('.content'), resetContainer, 10);
    }
  }

  getContainer(document_ = document) {
    const pag = this.paginationStrategy.getPaginationElement();
    return (
      pag?.parentElement.querySelector('.list-videos>div>form') ||
      pag?.parentElement.querySelector('.list-videos>div') ||
      document.querySelector('.list-videos>div') ||
      document_.querySelector('.playlist-holder, .list-playlists > div')
    );
  };

  isPrivate(thumb) {
    return thumb.classList.contains('private');
  }

  getThumbs(html) {
    return Array.from(
      html.querySelectorAll('.list-videos .item, .playlist .item, .list-playlists > div > .item') ||
      html.children,
    );
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img.thumb');
    const imgSrc = img.getAttribute('data-original');
    return { img, imgSrc };
  }

  getThumbUrl(thumb) {
    return thumb.firstElementChild.href || thumb.href;
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('.title')?.innerText);
    const duration = timeToSeconds(thumb.querySelector('.duration')?.innerText);
    return { title, duration };
  }
}

const RULES = new CAMWHORES_RULES();

//====================================================================================================

function rotateImg(src, count) {
  return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
}

function animate() {
  const tick = new Tick(ANIMATION_DELAY);
  $('img.thumb[data-cnt]').off();
  document.body.addEventListener('mouseover', (e) => {
    if (
      !e.target.tagName === 'IMG' ||
      !e.target.classList.contains('thumb') ||
      !e.target.getAttribute('src') ||
      /data:image|avatar/.test(e.target.src)
    )
      return;
    const origin = e.target.src;
    const count = parseInt(e.target.getAttribute('data-cnt')) || 5;
    tick.start(
      () => {
        e.target.src = rotateImg(e.target.src, count);
      },
      () => {
        e.target.src = origin;
      },
    );
    e.target.closest('.item').addEventListener('mouseleave', () => tick.stop(), { once: true });
  });
}

//====================================================================================================

const createDownloadButton = () =>
  downloader({
    append: '.tabs-menu > ul',
    button:
      '<li><a href="#tab_comments" class="toggle-button" style="text-decoration: none;">download 📼</a></li>',
    cbBefore: () => $('.fp-ui').click(),
  });

//====================================================================================================

const DEFAULT_FRIEND_REQUEST_FORMDATA = objectToFormData({
  message: '',
  action: 'add_to_friends_complete',
  function: 'get_block',
  block_id: 'member_profile_view_view_profile',
  format: 'json',
  mode: 'async',
});

const lskdb = new LSKDB();
const spool = new AsyncPool();

function friendRequest(id) {
  const url = Number.isInteger(id) ? `${location.origin}/members/${id}/` : id;
  return fetch(url, { body: DEFAULT_FRIEND_REQUEST_FORMDATA, method: 'post' });
}

function getMemberLinks(document) {
  return Array.from(document?.querySelectorAll('.item > a') || [], (l) => l.href).filter((l) =>
    /\/members\/\d+\/$/.test(l),
  );
}

async function getMemberFriends(id) {
  const url = RULES.IS_COMMUNITY_LIST
    ? `${location.origin}/members/`
    : `${location.origin}/members/${id}/friends/`;

  const doc = await fetchHtml(url);

  const paginationStrategy = getPaginationStrategy({
    doc,
    url,
    fixPaginationLast: (x) => x === 9 ? 999 : x
  });

  const paginationLast = paginationStrategy.getPaginationLast();
  const paginationUrlGenerator = paginationStrategy.getPaginationUrlGenerator();

  const pages = paginationLast
    ? range(paginationLast, 1).map((u) => paginationUrlGenerator(u))
    : [url];

  const friendlist = (await computeAsyncOneAtTime(pages.map((p) => () => fetchHtml(p))))
    .flatMap(getMemberLinks)
    .map((u) => u.match(/\d+/)[0]);

  friendlist.forEach((m) => { lskdb.setKey(m) });
  await processFriendship();
}

let processFriendshipStarted = false;
async function processFriendship(batchSize = 1) {
  if (!lskdb.isLocked()) {
    const friendlist = lskdb.getKeys(batchSize);
    if (friendlist?.length < 1) return;
    if (!processFriendshipStarted) {
      processFriendshipStarted = true;
      console.log('processFriendshipStarted');
    }
    lskdb.lock(true);
    const urls = friendlist.map((id) => `${location.origin}/members/${id}/`);
    await computeAsyncOneAtTime(
      urls.map((url) => async () => {
        await wait(FRIEND_REQUEST_INTERVAL);
        return friendRequest(url);
      }),
    );
    lskdb.lock(false);
    await processFriendship();
  }
}

function createPrivateVideoFriendButton() {
  if (!document.querySelector('.no-player')) return;
  const member = document.querySelector('.no-player a').href;
  const button = parseDom('<button class="friend-button"><span>Friend Request</span></button>');
  document.querySelector('.no-player .message').append(button);
  button.addEventListener('click', () => friendRequest(member), { once: true });
}

function createFriendButton() {
  const button = parseDom(
    '<a href="#friend_everyone" class="button friend-button"><span>Friend Everyone</span></a>',
  );
  (
    document.querySelector('.main-container-user > .headline') ||
    document.querySelector('.headline')
  ).append(button);
  const memberid = window.location.pathname.match(/\d+/)?.[0];
  button.addEventListener(
    'click',
    () => {
      button.style.background = 'radial-gradient(#ff6114, #5babc4)';
      button.innerText = 'processing requests';
      getMemberFriends(memberid).then(() => {
        button.style.background = 'radial-gradient(blue, lightgreen)';
        button.innerText = 'friend requests sent';
      });
    },
    { once: true },
  );
}

//====================================================================================================

async function requestAccess() {
  checkPrivateVidsAccess();
  setTimeout(processFriendship, FRIEND_REQUEST_INTERVAL);
}

Object.assign(window, { requestAccess });

async function checkPrivateVidsAccess() {
  const checkAccess = async (item) => {
    const videoURL = item.firstElementChild.href;
    const doc = await fetchHtml(videoURL);

    if (!doc.querySelector('.player')) return;

    const haveAccess = !doc.querySelector('.no-player');

    if (!haveAccess) {
      if (store.state.autoRequestAccess) {
        const uid = doc.querySelector('.message a').href.match(/\d+/).at(-1);
        lskdb.setKey(uid);
      }
      item.classList.add('haveNoAccess');
    } else {
      item.classList.add('haveAccess');
    }
  };

  const f = [];
  document.querySelectorAll('.item.private').forEach((item) => {
    if (!item.classList.contains('haveNoAccess') && !item.classList.contains('haveAccess')) {
      f.push(() => checkAccess(item));
    }
  });
  computeAsyncOneAtTime(f);
}

//====================================================================================================

function getUserInfo(document) {
  const uploadedCount = parseInt(document.querySelector('#list_videos_uploaded_videos strong')?.innerText.match(/\d+/)[0]) || 0;
  const friendsCount = parseInt(document.querySelector('#list_members_friends .headline')?.innerText.match(/\d+/).pop()) || 0;
  return {
    uploadedCount,
    friendsCount,
  };
}

async function acceptFriendRequest(id) {
  const url = `${location.origin}/my/messages/${id}/`;
  await fetch(url, {
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `action=confirm_add_to_friends&message_from_user_id=${id}&function=get_block&block_id=list_messages_my_conversation_messages&confirm=Confirm&format=json&mode=async`,
    method: 'POST',
  });
  await fetchHtml(`${location.origin}/members/${id}/`).then((doc) =>
    console.log('userInfo', getUserInfo(doc), url),
  );
}

function clearMessages() {
  const messagesURL = (id) =>
    `${location.origin}/my/messages/?mode=async&function=get_block&block_id=list_members_my_conversations&sort_by=added_date&from_my_conversations=${id}&_=${Date.now()}`;
  const last = Math.ceil(
    parseInt(document.body.innerText.match(/my messages .\d+./gi)[0].match(/\d+/)[0]) / 10,
  );
  if (!last) return;

  for (let i = 0; i < last; i++) {
    spool.push({
      v: () =>
        fetchHtml(messagesURL(i)).then((html_) => {
          const messages = Array.from(
            html_?.querySelectorAll('#list_members_my_conversations_items .item > a') || [],
          ).map((a) => a.href);
          messages.forEach((m) => { spool.push({ v: () => checkMessageHistory(m), p: 1 }) });
        }),
      p: 2,
    });
  }
  spool.run();

  let deleteCount = 0;

  function deleteMessage(url, id, message) {
    const deleteURL = `${url}?mode=async&format=json&function=get_block&block_id=list_messages_my_conversation_messages&action=delete_conversation&conversation_user_id=${id}`;
    return fetch(deleteURL).then((r) => {
      console.log(++deleteCount, r.status, 'delete', id, message);
    });
  }

  async function getConversation(url) {
    const doc = await fetchHtml(url);
    const hasFriendRequest = !!doc.querySelector('input[value=confirm_add_to_friends]');
    const hasOriginalText = doc.querySelector('.original-text')?.innerText;
    const id = url.match(/\d+/)[0];
    const messages = sanitizeStr(doc.querySelector('.list-messages').innerText);
    return {
      id,
      hasFriendRequest,
      hasOriginalText,
      messages
    }
  }

  async function checkMessageHistory(url) {
    const { hasOriginalText, hasFriendRequest, id, messages } = await getConversation(url);
    if (!(hasOriginalText || hasFriendRequest)) {
      spool.push({ v: () => deleteMessage(url, id, messages), p: 0 });
    } else {
      console.log({ hasOriginalText, url, messages });
      if (hasFriendRequest) {
        spool.push({ v: () => acceptFriendRequest(id), p: 0 });
      }
    }
  }
}

//====================================================================================================

// since script cannot be reloaded and scroll params need to be reset according to site options
function shouldReload() {
  const sortContainer = document.querySelector('.sort');
  if (!sortContainer) return;
  const reload = () => window.location.reload();
  watchDomChangesWithThrottle(sortContainer, reload, 1000);
}

//====================================================================================================

function handleLoadedThumbs() {
  const containers = getAllUniqueParents(RULES.getThumbs(document.body));
  containers.forEach((c) => { parseData(c, c) });
}

function shoudIScroll() {
  if (
    RULES.paginationStrategy.hasPagination &&
    !RULES.IS_MEMBER_PAGE &&
    !RULES.IS_MINE_MEMBER_PAGE
  ) {
    createInfiniteScroller(store, parseData, RULES);
    shouldReload();
  }
}

function route() {
  if (RULES.IS_LOGGED_IN) {
    setTimeout(processFriendship, FRIEND_REQUEST_INTERVAL);
    if (RULES.IS_MEMBER_PAGE || RULES.IS_COMMUNITY_LIST) {
      createFriendButton();
    }
  }

  if (!RULES.HAS_VIDEOS || !RULES.IS_LOGGED_IN) {
    delete defaultSchemeWithPrivacyFilter.privacyFilter;
  }

  if (RULES.HAS_VIDEOS) {
    const cb = () => {
      handleLoadedThumbs();
      shoudIScroll();
    };
    cb();
    if (RULES.IS_FAVOURITES) {
      watchDomChangesWithThrottle(document.querySelector('.content'), cb, 1000, 1);
    }
    new JabroniOutfitUI(store, defaultSchemeWithPrivacyFilter);
    animate();
  }

  if (RULES.IS_VIDEO_PAGE) {
    createDownloadButton();
    createPrivateVideoFriendButton();
  }

  if (RULES.IS_MESSAGES) {
    const button = parseDom('<button>clear messages</button>');
    document.querySelector('.headline').append(button);
    button.addEventListener('click', clearMessages);
  }
}

//====================================================================================================

console.log(LOGO);

const ANIMATION_DELAY = 500;
const FRIEND_REQUEST_INTERVAL = 5000;

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { applyFilters, parseData } = new DataManager(RULES, store.state);
store.subscribe(applyFilters);

route();
