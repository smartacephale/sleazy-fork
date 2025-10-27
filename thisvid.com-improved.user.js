// ==UserScript==
// @name         ThisVid.com Improved
// @namespace    http://tampermonkey.net/
// @version      7.0.2
// @license      MIT
// @description  Infinite scroll (optional). Preview for private videos. Filter: duration, public/private, include/exclude terms. Check access to private vids.  Mass friend request button. Sorts messages. Download button 📼
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.thisvid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thisvid.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.5.7/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.6.5/dist/jabroni-outfit.umd.js
// @require      https://cdn.jsdelivr.net/npm/lskdb@1.0.2/dist/lskdb.umd.js
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.meta.js
// ==/UserScript==
/* globals $ */

const {
  Tick,
  parseDom,
  fetchWith,
  fetchHtml,
  timeToSeconds,
  parseCSSUrl,
  circularShift,
  range,
  listenEvents,
  replaceElementTag,
  sanitizeStr,
  getPaginationStrategy,
  downloader,
  AsyncPool,
  computeAsyncOneAtTime,
  InfiniteScroller,
  createInfiniteScroller,
  DataManager,
  objectToFormData,
} = window.bhutils;
Object.assign(unsafeWindow, { bhutils: window.bhutils });
const {
  JabroniOutfitStore,
  defaultStateWithDurationAndPrivacyAndHD,
  JabroniOutfitUI,
  defaultSchemeWithPrivacyFilterWithHDwithSort,
} = window.jabronioutfit;
const { LSKDB } = window.lskdb;

const SponsaaLogo = `
    Kono bangumi ha(wa) goran no suponsaa no teikyou de okurishimasu⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡟⣟⢻⢛⢟⠿⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣿⣾⣾⣵⣧⣷⢽⢮⢧⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣯⣭⣧⣯⣮⣧⣯⣧⣯⡮⣵⣱⢕⣕⢕⣕⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⡫⡻⣝⢯⡻⣝⡟⣟⢽⡫⡟⣏⢏⡏⡝⡭⡹⡩⣻⣿⣿⣿⣿⠟⠟⢟⡟⠟⠻⠛⠟⠻⠻⣿⣿⣿⡟⠟⠻⠛⠟⠻⠻⣿⣿
    ⣿⣿⣿⣿⡿⣻⣿⣿⣿⡿⣿⣿⡿⣿⣿⢿⢿⡻⢾⠽⡺⡞⣗⠷⣿⣿⣿⡏⠀⠀⠀⣣⣤⡄⠀⠠⣄⡆⠫⠋⠻⢕⣤⡄⠀ ⢀⣤⣔⣿⣿
    ⣿⣿⣿⣿⣷⣷⣷⣾⣶⣯⣶⣶⣷⣷⣾⣷⣳⣵⣧⣳⡵⣕⣮⣞⣾⣿⡟⠄⢀⣦⠀⢘⣽⡇⠀⠨⣿⡌⠀⠣⣠⠹⠿⡭⠀ ⠐⣿⣿⣿⣿
    ⣿⣿⣿⣿⣕⣵⣱⣫⣳⡯⣯⣫⣯⣞⣮⣎⣮⣪⣢⣣⣝⣜⡜⣜⣾⣿⠃⠀⠀⠑⠀⠀⢺⡇⠀ ⢘⣾⠀⢄⢄⠘⠀⢘⢎⠀⢈⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣙⣛⣛⢻⢛⢟⢟⣛⢻⢹⣙⢳⢹⢚⢕⣓⡓⡏⣗⣿⣓⣀⣀⣿⣿⣮⢀⣀⣇⣀⣐⣿⣔⣀⢁⢀⣀⣀⣅⣀⡠⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣾⡞⣞⢷⡻⡯⡷⣗⢯⢷⢞⢷⢻⢞⢷⡳⣻⣺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣷⣵⡵⣼⢼⢼⡴⣵⢵⡵⣵⢵⡵⣵⣪⣾⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣮⣧⣫⣪⡪⡣⣫⣪⣣⣯⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
    ⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿`;

GM_addStyle(`
  .haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
  .haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
  .success { background: linear-gradient(#2f6eb34f, #66666647) !important; }
  .failure { background: linear-gradient(rgba(179, 47, 47, 0.31), rgba(102, 102, 102, 0.28)) !important; }
  .friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
  .friendProfile { background: radial-gradient(circle, rgb(28, 42, 50) 48%, rgb(0, 0, 0) 100%) !important; }
  `);

class THISVID_RULES {
  IS_MEMBER_PAGE = /^\/members\/\d+\/$/.test(location.pathname);
  IS_WATCHLATER_KIND = /^\/my_(\w+)_videos\//.test(location.pathname);
  IS_MESSAGES_PAGE = /^\/my_messages\//.test(location.pathname);
  IS_PLAYLIST = /^\/playlist\/\d+\//.test(location.pathname);
  IS_VIDEO_PAGE = /^\/videos\//.test(location.pathname);
  IS_MY_WALL = /^\/my_wall\//.test(location.pathname);

  HAS_VIDEOS = this.getThumbs(document).length > 0 || this.IS_MY_WALL;

  MY_ID = document.querySelector('[target="_self"]')?.href.match(/\/(\d+)\//)[1] || null;
  LOGGED_IN = !!this.MY_ID;
  IS_MY_MEMBER_PAGE = this.LOGGED_IN && !!document.querySelector('.my-avatar') && this.IS_MEMBER_PAGE;
  IS_OTHER_MEMBER_PAGE = !this.IS_MY_MEMBER_PAGE && this.IS_MEMBER_PAGE;
  IS_MEMBER_FRIEND =
    this.IS_OTHER_MEMBER_PAGE &&
    document.querySelector('.case-left')?.innerText.includes('is in your friends');

  paginationStrategy = getPaginationStrategy({});
  container = Array.from(document.querySelectorAll('.thumbs-items')).pop();

  constructor() {
    if (this.IS_MEMBER_FRIEND) {
      document.querySelector('.profile').classList.add('friendProfile');
    }

    if (this.IS_PLAYLIST) {
      const videoUrl = this.PLAYLIST_getThumbUrl(location.pathname);
      const desc = document.querySelector('.tools-left > li:nth-child(4) > .title-description');
      const link = replaceElementTag(desc, 'a');
      link.href = videoUrl;
    }
  }

  isHD(e) {
    return !e.querySelector('.quality');
  }

  getThumbs(html) {
    if (this.IS_WATCHLATER_KIND) {
      return Array.from(html.querySelectorAll('.thumb-holder'));
    }
    let thumbs = Array.from(html.querySelectorAll('.tumbpu[title]'));
    if (thumbs.length === 0 && html?.classList?.contains('tumbpu')) thumbs = [html];
    return thumbs.filter((thumb) => !thumb?.parentElement.classList.contains('thumbs-photo'));
  }

  PLAYLIST_getThumbUrl(src) {
    return src.replace(/playlist\/\d+\/video/, () => 'videos');
  }

  getThumbUrl(thumb) {
    if (this.IS_WATCHLATER_KIND) {
      return thumb.firstElementChild.href;
    }
    let url = thumb.getAttribute('href');
    if (this.IS_PLAYLIST) url = this.PLAYLIST_getThumbUrl(url);
    return url;
  }

  getThumbImgData(thumb) {
    const img = thumb.querySelector('img');
    const privateThumb = thumb.querySelector('.private');
    let imgSrc = img?.getAttribute('data-original');
    if (privateThumb) {
      imgSrc = parseCSSUrl(privateThumb.style.background);
      privateThumb.removeAttribute('style');
    }
    const count = img.getAttribute('data-cnt');
    if (!count || count === '6') img.removeAttribute('data-cnt');
    img.classList.remove('lazy-load');
    img.classList.add('tracking');

    if (this.IS_PLAYLIST) {
      img.onmouseover = img.onmouseout = null;
      img.removeAttribute('onmouseover');
      img.removeAttribute('onmouseout');
    }

    return { img, imgSrc };
  }

  getThumbData(thumb) {
    const title = sanitizeStr(thumb.querySelector('.title').innerText);
    const duration = timeToSeconds(thumb.querySelector('.thumb > .duration').textContent);
    const view = Number(thumb.querySelector('.view').textContent);
    return { title, duration, view };
  }

  isPrivate(thumb) {
    return !thumb.querySelector('.private');
  }
}

const RULES = new THISVID_RULES();

//====================================================================================================

function friend(id, message = '') {
  return fetchWith(FRIEND_REQUEST_URL(id, message));
}

function acceptFriendship(id) {
  const body = objectToFormData({
    action: 'confirm_add_to_friends',
    function: 'get_block',
    block_id: 'member_profile_view_view_profile',
    confirm: '',
    format: 'json',
    mode: 'async',
  });
  const url = `https://thisvid.com/members/${id}/`;
  return fetch(url, { body, method: 'post' });
}

const FRIEND_REQUEST_URL = (id, message = '') =>
  `https://thisvid.com/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=${message}`;

const USERS_PER_PAGE = 24;

async function getMemberFriends(memberId, start, end, by) {
  const { friendsCount } = await getMemberData(memberId);
  const offset = Math.ceil(friendsCount / USERS_PER_PAGE);

  let friendsURL = `https://thisvid.com/members/${memberId}/friends/`;
  if (by === 'activity') friendsURL = 'https://thisvid.com/my_friends_by_activity/';
  if (by === 'popularity') friendsURL = 'https://thisvid.com/my_friends_by_popularity/';

  const pages = range(offset)
    .slice(start, end)
    .map((o) => `${friendsURL}${o}/`);
  const pagesFetched = pages.map((p) => fetchHtml(p));
  const friends = (await Promise.all(pagesFetched)).flatMap(getMembers);
  return friends;
}

function getMembers(el) {
  const friendsList = el.querySelector('#list_members_friends_items') || el;
  return Array.from(friendsList.querySelectorAll('.tumbpu') || [])
    .map((e) => e.href.match(/\d+/)?.[0])
    .filter((_) => _);
}

async function friendMemberFriends(orientationFilter) {
  const memberId = window.location.pathname.match(/\d+/)[0];
  friend(memberId);
  const friends = await getMemberFriends(memberId);
  const spool = new AsyncPool(60);
  friends
    .map((fid) => {
      if (!orientationFilter) return () => friend(fid);
      return () =>
        getMemberData(fid).then(async ({ orientation, uploadedPrivate }) => {
          if (
            uploadedPrivate > 0 &&
            (orientation === orientationFilter ||
              (orientationFilter === 'Straight' && orientation === 'Lesbian'))
          ) {
            await friend(fid);
          }
        });
    })
    .forEach((f) => { spool.push(f) });
  await spool.run();
}

function initFriendship() {
  GM_addStyle(
    '.buttons {display: flex; flex-wrap: wrap} .buttons button, .buttons a {align-self: center; padding: 4px; margin: 5px;}',
  );

  const buttonAll = parseDom(
    '<button style="background: radial-gradient(red, blueviolet);">friend everyone</button>',
  );
  const buttonStraightOnly = parseDom(
    '<button style="background: radial-gradient(red, #a18cb5);">friend straights</button>',
  );
  const buttonGayOnly = parseDom(
    '<button style="background: radial-gradient(red, #46baff);">friend gays</button>',
  );
  const buttonBisexualOnly = parseDom(
    '<button style="background: radial-gradient(red, #4ebaaf);">friend bisexuals</button>',
  );

  document
    .querySelector('.buttons')
    .append(buttonAll, buttonStraightOnly, buttonGayOnly, buttonBisexualOnly);

  buttonAll.addEventListener('click', (e) => handleClick(e), { once: true });
  buttonStraightOnly.addEventListener('click', (e) => handleClick(e, 'Straight'), { once: true });
  buttonGayOnly.addEventListener('click', (e) => handleClick(e, 'Gay'), { once: true });
  buttonBisexualOnly.addEventListener('click', (e) => handleClick(e, 'Bisexual'), { once: true });

  function handleClick(e, orientationFilter) {
    const button = e.target;
    button.style.background = 'radial-gradient(#ff6114, #5babc4)';
    button.innerText = 'processing requests';
    friendMemberFriends(orientationFilter).then(() => {
      button.style.background = 'radial-gradient(blue, lightgreen)';
      button.innerText = 'friend requests sent';
    });
  }
}

//====================================================================================================

async function getMemberData(id) {
  const url = id.includes('member') ? id : `/members/${id}/`;
  const doc = await fetchHtml(url);
  const data = {};

  doc.querySelectorAll('.profile span').forEach((s) => {
    if (s.innerText.includes('Name:')) {
      data.name = s.firstElementChild.innerText.trim();
    }
    if (s.innerText.includes('Orientation:')) {
      data.orientation = s.firstElementChild.innerText.trim();
    }
    if (s.innerText.includes('Videos uploaded:')) {
      data.uploadedPublic = parseInt(s.children[0].innerText);
      data.uploadedPrivate = parseInt(s.children[1].innerText);
    }
  });

  data.friendsCount =
    parseInt(
      doc.querySelector('#list_members_friends')?.firstElementChild.innerText.match(/\d+/g).pop(),
    ) || 0;

  return data;
}

//====================================================================================================

function requestAccessVideoPage() {
  const holder = document.querySelector('.video-holder > p');
  if (holder) {
    const uploader = document.querySelector('a.author').href.match(/\d+/).at(-1);
    const button = parseDom(
      `<button onclick="requestPrivateAccess(event, ${uploader}); this.onclick=null;">Friend Request</button>`,
    );
    holder.parentElement.append(button);
  }
}

unsafeWindow.requestPrivateAccess = (e, memberid) => {
  e.preventDefault();
  friend(memberid, '');
  e.target.innerText = e.target.innerText.replace('🚑', '🍆');
};

async function checkPrivateVideoAccess(url) {
  const html = await fetchHtml(url);
  const holder = html.querySelector('.video-holder > p');

  const access = !holder;

  const uploaderEl = holder ? holder.querySelector('a') : html.querySelector('a.author');
  const uploaderURL = uploaderEl.href.match(/\d+/).at(-1);
  const uploaderName = uploaderEl.innerText;

  return {
    access,
    uploaderURL,
    uploaderName,
  };
}

function getUncheckedPrivateThumbs(html = document) {
  const thumbs = html.querySelectorAll(
    '.tumbpu:has(.private):not(.haveNoAccess):not(haveAccess), .thumb-holder:has(.private):not(.haveNoAccess):not(haveAccess)',
  );
  return Array.from(thumbs);
}

const uploadersChecked = new Set();

async function requestAccess() {
  const checkAccess = async (thumb) => {
    const { access, uploaderURL } = await checkPrivateVideoAccess(RULES.getThumbUrl(thumb));

    if (access) {
      thumb.classList.add('haveAccess');
      return;
    }
    thumb.classList.add('haveNoAccess');

    if (state.autoRequestAccess && !uploadersChecked.has(uploaderURL)) {
      acceptFriendship(uploaderURL);
      friend(uploaderURL);
    }
  };

  computeAsyncOneAtTime(getUncheckedPrivateThumbs().map((t) => () => checkAccess(t)));
}

Object.assign(window, { requestAccess });

//====================================================================================================

const createDownloadButton = () =>
  downloader({
    append: '',
    after: '.share_btn',
    button: '<li><a href="#" style="text-decoration: none;font-size: 2rem;">📼</a></li>',
    cbBefore: () => $('.fp-ui').click(),
  });

//====================================================================================================

class PreviewAnimation {
  constructor(element, delay = 750) {
    $('img[alt!="Private"]').off();
    this.tick = new Tick(delay);
    listenEvents(element, ['mouseover', 'touchstart'], this.animatePreview);
  }

  ITERATE_PREVIEW_IMG = (img) => {
    const count = parseInt(img.getAttribute('data-cnt')) || 6;
    img.src = img
      .getAttribute('src')
      .replace(/(\d+)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
  };

  animatePreview = (e) => {
    const { target: el, type } = e;
    if (!el.classList.contains('tracking') || !el.getAttribute('src')) return;
    this.tick.stop();
    if (type === 'mouseover' || type === 'touchstart') {
      const orig = el.getAttribute('src');
      this.tick.start(
        () => this.ITERATE_PREVIEW_IMG(el),
        () => {
          el.src = orig;
        },
      );
      el.addEventListener(
        type === 'mouseover' ? 'mouseleave' : 'touchend',
        () => this.tick.stop(),
        { once: true },
      );
    }
  };
}

//====================================================================================================

const lskdb = new LSKDB();

async function getMemberVideos(id, type = 'private') {
  const { uploadedPrivate, uploadedPublic, name } = await getMemberData(id);
  const videosCount = type === 'private' ? uploadedPrivate : uploadedPublic;

  const url = `https://thisvid.com/members/${id}/${type}_videos/`;
  const doc = await fetchHtml(url);

  const paginationStrategy = getPaginationStrategy({ doc, url });

  const memberVideosGenerator = InfiniteScroller.createPaginationGenerator(
    0,
    paginationStrategy.getPaginationLast(),
    paginationStrategy.getPaginationUrlGenerator(),
  );

  return { name, videosCount, memberVideosGenerator };
}

async function getMembersVideos(id, friendsCount, memberGeneratorCallback, type = 'private', by) {
  let skipFlag = false;
  let skipCount = 1;
  let minVideosCount = 1;

  const skipCurrentMember = (n = 1) => {
    skipFlag = true;
    skipCount = n;
  };
  const filterVideosCount = (n = 1) => {
    minVideosCount = n;
  };

  let membersIds = await getMemberFriends(id, 0, 1, by);
  /////////
  ////
  ///
  ///
  //
  getMemberFriends(id, 1, 3, by).then((r) => {
    membersIds = membersIds.concat(r);
  });

  async function* pageGenerator() {
    let currentGenerator = null;
    for (let c = 0; c < friendsCount - 1; c++) {
      if (lskdb.hasKey(membersIds[c])) continue;

      if (!currentGenerator) {
        const { memberVideosGenerator, name, videosCount } = await getMemberVideos(
          membersIds[c],
          type,
        );

        if (memberVideosGenerator && videosCount >= minVideosCount) {
          currentGenerator = memberVideosGenerator;
          memberGeneratorCallback(name, videosCount, membersIds[c]);
        } else continue;
      }

      const { value: { url } = {}, done } = await currentGenerator.next();

      if (done || skipFlag) {
        c += skipCount - 1;
        skipCount = 1;
        currentGenerator = null;
        skipFlag = false;
      } else {
        yield { url, offset: c };
      }
    }
  }

  return {
    pageGenerator: () => pageGenerator(membersIds, type),
    skipCurrentMember,
    filterVideosCount,
  };
}

function createPrivateFeedButton() {
  const container = document.querySelectorAll('.sidebar ul')[1];

  const links = [
    { hov: '#private_feed', text: 'My Private Feed' },
    { hov: '#private_feed_popularity', text: 'My Private Feed by Popularity' },
    { hov: '#private_feed_activity', text: 'My Private Feed by Activity' },
    { hov: '#public_feed', text: 'My Public Feed' },
    { hov: '#public_feed_popularity', text: 'My Public Feed by Popularity' },
    { hov: '#public_feed_activity', text: 'My Public Feed by Activity' },
  ];

  links.forEach(({ hov, text }) => {
    const button = parseDom(
      `<li><a href="https://thisvid.com/my_wall/${hov}" class="selective"><i class="ico-arrow"></i>${text}</a></li>`,
    );
    container.append(button);
  });
}

async function createPrivateFeed() {
  createPrivateFeedButton();
  if (!location.hash.includes('feed')) return;
  const isPubKey = window.location.hash.includes('public_feed') ? 'public' : 'private';
  const sortByFeed = window.location.hash.includes('activity')
    ? 'activity'
    : window.location.hash.includes('popularity')
      ? 'popularity'
      : undefined;

  const container = parseDom('<div class="thumbs-items"></div>');
  const ignored = parseDom('<div class="ignored"><h2>IGNORED:</h2></div>');

  Object.assign(defaultSchemeWithPrivacyFilterWithHDwithSort, {
    controlsSkip: [
      { type: 'button', innerText: 'skip 10', callback: async () => skip(10) },
      { type: 'button', innerText: 'skip 100', callback: async () => skip(100) },
      { type: 'button', innerText: 'skip 1000', callback: async () => skip(1000) },
    ],
    controlsFilter: [
      { type: 'button', innerText: 'filter >10', callback: async () => filterVidsCount(10) },
      { type: 'button', innerText: 'filter >25', callback: async () => filterVidsCount(25) },
      { type: 'button', innerText: 'filter >100', callback: async () => filterVidsCount(100) },
    ],
  });

  const containerParent = document.querySelector('.main > .container > .content');
  containerParent.innerHTML = '';
  containerParent.nextElementSibling.remove();
  containerParent.append(container);
  container.before(ignored);

  GM_addStyle(`
   .content { width: auto; }
   .member-videos, .ignored { background: #b3b3b324; min-height: 3rem; margin: 1rem 0px; color: #fff; font-size: 1.24rem; display: flex; flex-wrap: wrap; justify-content: center;
     padding: 10px; width: 100%; }
   .member-videos * {  padding: 5px; margin: 4px; }
   .member-videos h2 a { font-size: 1.24rem; margin: 0; padding: 0; display: inline; }
   .ignored * {  padding: 4px; margin: 5px; }
   .thumbs-items { display: flex; flex-wrap: wrap; }`);

  const { friendsCount } = await getMemberData(RULES.MY_ID);

  const { pageGenerator, skipCurrentMember, filterVideosCount } = await getMembersVideos(
    RULES.MY_ID,
    friendsCount,
    (name, videosCount, id) => {
      container.append(
        parseDom(`
       <div class="member-videos" id="mem-${id}">
         <h2><a href="/members/${id}/">${name}</a> ${videosCount} videos</h2>
         <button onClick="hideMemberVideos(event)">ignore 🗡</button>
         <button onClick="hideMemberVideos(event, false)">skip</button>
       </div>`),
      );
    },
    isPubKey,
    sortByFeed,
  );

  Object.assign(RULES, {
    container,
    intersectionObservable: document.querySelector('.footer'),
    alternativeGenerator: pageGenerator
  });
  RULES.paginationStrategy.getPaginationLast = () => friendsCount;

  const ignoredMembers = lskdb.getAllKeys();
  ignoredMembers.forEach((im) => {
    document
      .querySelector('.ignored')
      .append(parseDom(`<button id="#ir-${im}" onClick="unignore(event)">${im} 🗡</button>`));
  });

  const skip = (n) => {
    skipCurrentMember(n);
    document.querySelector('.thumbs-items').innerHTML = '';
  };

  unsafeWindow.hideMemberVideos = (e, ignore = true) => {
    let id = e.target.parentElement.id;
    if (!document.querySelector(`#${id} ~ div`)) {
      skipCurrentMember();
    }
    const box = document.getElementById(id);
    const toDelete = [box];
    let curr = box.nextElementSibling;
    while (curr?.classList.contains('tumbpu')) {
      toDelete.push(curr);
      curr = curr.nextElementSibling;
    }
    toDelete.forEach((e) => { e.remove() });
    id = id.slice(4);
    if (ignore) {
      document
        .querySelector('.ignored')
        .append(parseDom(`<button id="irm-${id}" onClick="unignore(event)">${id} X</button>`));
      lskdb.setKey(id);
    }
  };

  unsafeWindow.unignore = (e) => {
    const id = e.target.id.slice(4);
    lskdb.removeKey(id);
    e.target.remove();
  };

  const filterVidsCount = (count) => filterVideosCount(count);

  createInfiniteScroller(store, parseData, RULES);
}

//====================================================================================================

// async function sendMessage(uid, message = 'add me pls') {
//   const url = new URL(
//     `https://thisvid.com/members/${uid}/?action=send_message_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async`,
//   );
//   url.searchParams.append('message', message);
//   await fetch(url.href);
// }

function deleteMsg(id) {
  const url = `https://thisvid.com/my_messages/inbox/?mode=async&format=json&action=delete&function=get_block&block_id=list_messages_my_conversation_messages&delete[]=${id}`;
  fetch(url).then((res) => console.log(url, res?.status));
}

async function clearMessages() {
  const sortMsgs = (doc) => {
    doc.querySelectorAll('.entry').forEach((e) => {
      const id = e.querySelector('input[name="delete[]"]').value;
      const msg = e.querySelector('.user-comment').innerText;
      if (/has confirmed|declined your|has removed/g.test(msg)) deleteMsg(id);
    });
  };

  await Promise.all(
    Array.from({ length: RULES.paginationStrategy.getPaginationLast() }, (_, i) =>
      fetchHtml(`https://thisvid.com/my_messages/inbox/${i + 1}/`).then((html) => sortMsgs(html)),
    ),
  );
}

function clearMessagesButton() {
  const btn = parseDom('<button>clear messages</button>');
  btn.addEventListener('click', clearMessages);
  document.querySelector('.headline').append(btn);
}

function highlightMessages() {
  for (const member of document.querySelectorAll('.user-avatar > a')) {
    getMemberData(member.href).then(({ uploadedPublic, uploadedPrivate }) => {
      if (uploadedPrivate > 0) {
        const success = !member.parentElement.nextElementSibling.innerText.includes('declined');
        member.parentElement.parentElement.classList.add(success ? 'success' : 'failure');
      }
      member.parentElement.parentElement.querySelector('.user-comment p').innerText +=
        `  |  videos: ${uploadedPublic} public, ${uploadedPrivate} private`;
    });
  }
}

//====================================================================================================

function route() {
  console.log(SponsaaLogo);

  if (!RULES.LOGGED_IN) {
    delete defaultSchemeWithPrivacyFilterWithHDwithSort.privacyAccess;
  }

  if (RULES.IS_MY_MEMBER_PAGE || RULES.IS_MY_WALL) {
    createPrivateFeed();
  }

  if (RULES.IS_MESSAGES_PAGE) {
    clearMessagesButton();
    highlightMessages();
  }

  if (RULES.IS_VIDEO_PAGE) {
    requestAccessVideoPage();
    createDownloadButton();
  }

  if (RULES.IS_OTHER_MEMBER_PAGE) {
    initFriendship();
  }

  if (RULES.HAS_VIDEOS) {
    new PreviewAnimation(document.body);

    const containers = Array.from(
      RULES.IS_WATCHLATER_KIND
        ? [RULES.container]
        : document.querySelectorAll('.thumbs-items:not(.thumbs-members)'),
    );

    if (containers.length > 1 && !RULES.IS_MEMBER_PAGE) RULES.container = containers[0];
    containers.forEach((c) => {
      parseData(c, RULES.IS_MEMBER_PAGE ? c : RULES.container, true);
    });

    if (RULES.paginationStrategy.hasPagination) createInfiniteScroller(store, parseData, RULES);
  }

  new JabroniOutfitUI(store, defaultSchemeWithPrivacyFilterWithHDwithSort);
}

//====================================================================================================

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacyAndHD);
const { state } = store;
const { applyFilters, parseData } = new DataManager(RULES, state);
store.subscribe(applyFilters);

route();
