// ==UserScript==
// @name         ThisVid.com Improved
// @namespace    http://tampermonkey.net/
// @version      5.2.0
// @license      MIT
// @description  Infinite scroll (optional). Preview for private videos. Filter: duration, public/private, include/exclude terms. Check access to private vids.  Mass friend request button. Sorts messages. Download button 📼
// @author       smartacephale
// @supportURL   https://github.com/smartacephale/sleazy-fork
// @match        https://*.thisvid.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thisvid.com
// @grant        GM_addStyle
// @require      https://cdn.jsdelivr.net/npm/billy-herrington-utils@1.3.0/dist/billy-herrington-utils.umd.js
// @require      https://cdn.jsdelivr.net/npm/jabroni-outfit@1.4.9/dist/jabroni-outfit.umd.js
// @require      https://cdn.jsdelivr.net/npm/lskdb@1.0.2/dist/lskdb.umd.js
// @require      https://update.greasyfork.org/scripts/494204/data-manager.user.js?version=1458190
// @run-at       document-idle
// @downloadURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.user.js
// @updateURL https://update.sleazyfork.org/scripts/485716/ThisVidcom%20Improved.meta.js
// ==/UserScript==
/* globals $ DataManager PaginationManager */

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
  chunks,
  downloader,
  AsyncPool,
  computeAsyncOneAtTime,
  InfiniteScroller,
} = window.bhutils;
Object.assign(unsafeWindow, { bhutils: window.bhutils });
const {
  JabroniOutfitStore,
  defaultStateWithDurationAndPrivacy,
  JabroniOutfitUI,
  defaultSchemeWithPrivateFilter,
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
  delay = 350;

  constructor() {
    const { href, pathname } = window.location;

    this._PAGINATION_ALLOWED = [
      /\.com\/$/,
      /\/(categories|tags?)\//,
      /\/?q=.*/,
      /\/(\w+-)?(rated|popular|private|newest|winners|updates)\/(\d+\/)?$/,
      /\/members\/\d+\/\w+_videos\//,
      /\/playlist\/\d+\//,
      /\/my_(\w+)_videos\//,
      /\/my_wall\/#\w+/,
    ].some((r) => r.test(href));

    this.IS_MEMBER_PAGE = /^\/members\/\d+\/$/.test(pathname);
    this.IS_WATCHLATER_KIND = /^\/my_(\w+)_videos\//.test(pathname);
    this.IS_MESSAGES_PAGE = /^\/my_messages\//.test(pathname);
    this.IS_PLAYLIST = /^\/playlist\/\d+\//.test(pathname);
    this.IS_VIDEO_PAGE = /^\/videos\//.test(pathname);

    this.PAGE_HAS_VIDEO = this.GET_THUMBS(document).length > 0;

    this.paginationElement = document.querySelector('.pagination');
    this.paginationLast = this.getPaginationLast();
    this.paginationOffset = this.getPaginationOffset();
    this.paginationUrlGenerator = this.getPaginationGenerator();

    this.CONTAINER = Array.from(document.querySelectorAll('.thumbs-items')).pop();

    this.MY_ID = document.querySelector('[target="_self"]')?.href.match(/\/(\d+)\//)[1] || null;
    this.LOGGED_IN = !!this.MY_ID;
    this.IS_MY_MEMBER_PAGE = this.LOGGED_IN && !!document.querySelector('.my-avatar');
    this.IS_OTHER_MEMBER_PAGE = !this.IS_MY_MEMBER_PAGE && this.IS_MEMBER_PAGE;
    this.IS_MEMBER_FRIEND =
      this.IS_OTHER_MEMBER_PAGE &&
      document.querySelector('.case-left')?.innerText.includes('is in your friends');

    if (this.IS_MEMBER_FRIEND) {
      document.querySelector('.profile').classList.add('friendProfile');
    }

    // playlist page add link to video
    if (this.IS_PLAYLIST) {
      const videoUrl = this.PLAYLIST_THUMB_URL(pathname);
      const desc = document.querySelector('.tools-left > li:nth-child(4) > .title-description');
      const link = replaceElementTag(desc, 'a');
      link.href = videoUrl;
    }
  }

  getPaginationOffset() {
    return this.IS_PLAYLIST ? 1 : parseInt(location.pathname.match(/\/(\d+)\/?$/)?.[1]) || 1;
  }

  getPaginationLast(doc) {
    const e = doc || document;
    return parseInt(e.querySelector('.pagination-next')?.previousElementSibling?.innerText) || 1;
  }

  GET_THUMBS(html) {
    if (this.IS_WATCHLATER_KIND) {
      return Array.from(html.querySelectorAll('.thumb-holder'));
    }
    let thumbs = Array.from(html.querySelectorAll('.tumbpu[title]'));
    if (thumbs.length === 0 && html?.classList?.contains('tumbpu')) thumbs = [html];
    return thumbs.filter((thumb) => !thumb?.parentElement.classList.contains('thumbs-photo'));
  }

  PLAYLIST_THUMB_URL(src) {
    return src.replace(/playlist\/\d+\/video/, () => 'videos');
  }

  THUMB_URL(thumb) {
    if (this.IS_WATCHLATER_KIND) {
      return thumb.firstElementChild.href;
    }
    let url = thumb.getAttribute('href');
    if (this.IS_PLAYLIST) url = this.PLAYLIST_THUMB_URL(url);
    return url;
  }

  getPaginationGenerator(proxyLocation) {
    const url = new URL(proxyLocation || window.location);

    if (url.pathname === '/') url.pathname = '/latest-updates/';
    if (!/\/(\d+)\/?$/.test(url.pathname)) url.pathname = `${url.pathname}${this.paginationOffset}/`;

    const paginationUrlGenerator = (n) => {
      if (this.IS_PLAYLIST) {
        url.search = `mode=async&function=get_block&block_id=playlist_view_playlist_view&sort_by=added2fav_date&from=${n}&_=${Date.now()}`;
      } else {
        url.pathname = url.pathname.replace(/\/\d+\/$/, `/${n}/`);
      }
      return url.href;
    };

    return paginationUrlGenerator;
  }

  THUMB_IMG_DATA(thumb) {
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

  THUMB_DATA(thumb) {
    const title = sanitizeStr(thumb.querySelector('.title').innerText);
    const duration = timeToSeconds(thumb.querySelector('.thumb > .duration').textContent);
    return { title, duration };
  }

  IS_PRIVATE(thumb) {
    return !thumb.querySelector('.private');
  }
}

const RULES = new THISVID_RULES();

//====================================================================================================

function friend(id, message = '') {
  return fetchWith(FRIEND_REQUEST_URL(id, message));
}

const FRIEND_REQUEST_URL = (id, message = '') =>
  `https://thisvid.com/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=${message}`;

const USERS_PER_PAGE = 24;

async function getMemberFriends(memberId, start, end) {
  const { friendsCount } = await getMemberData(memberId);
  const offset = Math.ceil(friendsCount / USERS_PER_PAGE);
  const pages = range(offset)
    .slice(start, end)
    .map((o) => `https://thisvid.com/members/${memberId}/friends/${o}/`);
  const pagesFetched = pages.map((p) => fetchHtml(p));
  const friends = (await Promise.all(pagesFetched)).flatMap(getMembers);
  return friends;
}

function getMembers(el) {
  const friendsList = el.querySelector('#list_members_friends_items');
  return Array.from(friendsList?.querySelectorAll('.tumbpu') || [])
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
    .forEach((f) => spool.push(f));
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

async function sendMessage(uid, message = 'add me pls') {
  const url = new URL(
    `https://thisvid.com/members/${uid}/?action=send_message_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async`,
  );
  url.searchParams.append('message', message);
  await fetch(url.href);
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

const uploadersNotInFriendlist = new Set();

async function requestAccess() {
  const checkAccess = async (thumb) => {;
    const { access, uploaderURL } = await checkPrivateVideoAccess(thumb.querySelector('a').href);

    if (!access) {
      thumb.classList.add('haveNoAccess');

      if (!uploadersNotInFriendlist.has(uploaderURL)) friend(uploaderURL);
    } else {
      thumb.classList.add('haveAccess');
    }
  };

  const f = [];
  document.querySelectorAll('.tumbpu:has(.private), .thumb-holder:has(.private)').forEach((thumb) => {
    if (!thumb.classList.contains('haveNoAccess') && !thumb.classList.contains('haveAccess')) {
      f.push(() => checkAccess(thumb));
    }
  });
  computeAsyncOneAtTime(f);
}

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

const lskdb = new LSKDB();

async function getMemberVideos(id, type = 'private') {
  const { uploadedPrivate, uploadedPublic, name } = await getMemberData(id);
  const videosCount = type === 'private' ? uploadedPrivate : uploadedPublic;
  const paginationLast = Math.ceil(videosCount / 48);

  const iteratable_url = RULES.getPaginationGenerator(
    new URL(`https://thisvid.com/members/${id}/${type}_videos/`),
  );
  const memberVideosGenerator = InfiniteScroller.createPaginationGenerator(
    0,
    paginationLast,
    iteratable_url,
  );
  return { name, videosCount, memberVideosGenerator };
}

async function getMembersVideos(id, friendsCount, memberGeneratorCallback, type = 'private') {
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

  let membersIds = await getMemberFriends(id, 0, 1);
  getMemberFriends(id, 1).then((r) => {
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

      const {
        value: { url } = {},
        done,
      } = await currentGenerator.next();

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
  const buttonPrv = parseDom(
    `<li><a href="https://thisvid.com/my_wall/#private_feed" class="selective"><i class="ico-arrow"></i>My Friends Private Videos</a></li>`,
  );
  const buttonPub = parseDom(
    `<li><a href="https://thisvid.com/my_wall/#public_feed" class="selective"><i class="ico-arrow"></i>My Friends Public Videos</a></li>`,
  );
  container.append(buttonPub, buttonPrv);
}

async function createPrivateFeed() {
  createPrivateFeedButton();
  if (!window.location.hash.includes('feed')) return;
  const isPubKey = window.location.hash === '#public_feed';

  const container = parseDom('<div class="thumbs-items"></div>');
  const ignored = parseDom('<div class="ignored"><h2>IGNORED:</h2></div>');

  Object.assign(defaultSchemeWithPrivateFilter, {
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
  GM_addStyle(`.content { width: auto; }
 .member-videos, .ignored { background: #b3b3b324; min-height: 3rem; margin: 1rem 0px; color: #fff; font-size: 1.24rem; display: flex; flex-wrap: wrap; justify-content: center;
   padding: 10px; width: 100%; }
 .member-videos * {  padding: 5px; margin: 4px; }
 .member-videos h2 a { font-size: 1.24rem; margin: 0; padding: 0; display: inline; }
 .ignored * {  padding: 4px; margin: 5px; }
 .thumbs-items { display: flex; flex-wrap: wrap; }`);

  RULES.intersectionObservable = document.querySelector('.footer');
  RULES.CONTAINER = container;

  const { friendsCount } = await getMemberData(RULES.MY_ID);

  RULES.paginationLast = friendsCount;

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
    isPubKey ? 'public' : 'private',
  );

  RULES.alternativeGenerator = pageGenerator;

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
    toDelete.forEach((e) => e.remove());
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

  initInfiniteScroll();
}

//====================================================================================================

async function clearMessages() {
  const sortMsgs = (doc) => {
    doc.querySelectorAll('.entry').forEach((e) => {
      const id = e.querySelector('input[name="delete[]"]').value;
      const msg = e.querySelector('.user-comment').innerText;
      if (/has confirmed|declined your|has removed/g.test(msg)) deleteMsg(id);
    });
  };

  const deleteMsg = (id) => {
    const url = `https://thisvid.com/my_messages/inbox/?mode=async&format=json&action=delete&function=get_block&block_id=list_messages_my_conversation_messages&delete[]=${id}`;
    fetch(url).then((res) => console.log(url, res?.status));
  };

  await Promise.all(
    Array.from({ length: RULES.paginationLast }, (_, i) =>
      fetchHtml(`https://thisvid.com/my_messages/inbox/${i + 1}/`).then((html) => sortMsgs(html)),
    ),
  );
}

function clearMessagesButton() {
  const btn = parseDom('<button>clear messages</button>');
  btn.addEventListener('click', clearMessages);
  document.querySelector('.headline').append(btn);
}

//====================================================================================================

function initInfiniteScroll() {
  const iscroller = new InfiniteScroller({
    enabled: state.infiniteScrollEnabled,
    handleHtmlCallback: handleLoadedHTML,
    ...RULES
  }).onScroll((i) => {
    stateLocale.pagIndexLast = i.paginationLast;
    stateLocale.pagIndexCur = i.paginationOffset;
  });

  store.subscribe(() => { iscroller.enabled = state.infiniteScrollEnabled; });

  return iscroller;
}

function route() {
  console.log(SponsaaLogo);

  if (RULES.LOGGED_IN) {
    defaultSchemeWithPrivateFilter.privateFilter.push({
      type: 'button',
      innerText: 'request access 🔓',
      callback: requestAccess,
    });
  }

  if (RULES.IS_MY_MEMBER_PAGE) {
    createPrivateFeed();
    RULES.PAGE_HAS_VIDEO = true;
  }

  if (RULES.IS_MESSAGES_PAGE) {
    clearMessagesButton();
    highlightMessages();
  }

  if (RULES.IS_VIDEO_PAGE) {
    const holder = document.querySelector('.video-holder > p');
    if (holder) {
      const uploader = document.querySelector('a.author').href.match(/\d+/).at(-1);
      holder.parentElement.append(
        parseDom(
          `<button onclick="requestPrivateAccess(event, ${uploader}); this.onclick=null;">Friend Request</button>`,
        ),
      );
    }
    createDownloadButton();
  }

  if (!RULES.PAGE_HAS_VIDEO) return;

  const containers = Array.from(
    RULES.IS_WATCHLATER_KIND
      ? [RULES.CONTAINER]
      : document.querySelectorAll('.thumbs-items:not(.thumbs-members)'),
  );

  if (containers.length > 1 && !RULES.IS_MEMBER_PAGE) RULES.CONTAINER = containers[0];
  containers.forEach((c) => {
    handleLoadedHTML(c, RULES.IS_MEMBER_PAGE ? c : RULES.CONTAINER, true);
  });

  new PreviewAnimation(document.body);
  new JabroniOutfitUI(store, defaultSchemeWithPrivateFilter);

  if (RULES.IS_OTHER_MEMBER_PAGE) {
    initFriendship();
  }

  if (RULES._PAGINATION_ALLOWED) {
    stateLocale.pagIndexLast = RULES.paginationLast;
    if (!RULES.paginationElement) return;
    initInfiniteScroll();
  }
}

//====================================================================================================

const store = new JabroniOutfitStore(defaultStateWithDurationAndPrivacy);
const { state, stateLocale } = store;
const { applyFilters, handleLoadedHTML } = new DataManager(RULES, state);
store.subscribe(applyFilters);

route();
