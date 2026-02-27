import { LSKDB } from 'lskdb';
import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addStyle, unsafeWindow } from '$';
import { getPaginationStrategy, InfiniteScroller, Rules } from '../../core';
import {
  circularShift,
  downloader,
  fetchHtml,
  OnHover,
  objectToFormData,
  parseHtml,
  querySelectorLastNumber,
  querySelectorText,
  Tick,
  wait,
} from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'CamWhores PervertMonkey',
  version: '3.0.7',
  description:
    'Infinite scroll [optional]. Filter by Title, Duration and Private/Public. Mass friend request button. Download button',
  match: ['https://*.camwhores.tv', 'https://*.camwhores.*/*'],
  exclude: 'https://*.camwhores.tv/*mode=async*',
};

const $ = (unsafeWindow as any).$;

GM_addStyle(`
.item.private .thumb, .item .thumb.private { opacity: 1 !important; }
.haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
.haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
.friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
`);

const IS_MEMBER_PAGE = /^(\/members\/\d+\/|\/my\/)$/.test(location.pathname);
const IS_MESSAGES = /^\/my\/messages\//.test(location.pathname);
const IS_COMMUNITY_LIST = /\/members\/$/.test(location.pathname);
const IS_VIDEO_PAGE = /^(\/videos)?\/\d+\//.test(location.pathname);
const IS_LOGGED_IN = document.cookie.includes('kt_member');

const rules = new Rules({
  containerSelector:
    '[id*="playlist"]:has(> .item .title),[id*="videos"]:has(> .item .title),form:has(>.item .title)',
  paginationStrategyOptions: {
    paginationSelector: '.pagination:not([id *= member])',
    overwritePaginationLast: IS_MEMBER_PAGE ? () => 1 : (x) => (x === 9 ? 9999 : x),
  },
  thumbs: {
    selector:
      '.list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)',
  },
  thumb: {
    strategy: 'auto-select',
    selectors: {
      private: { type: 'boolean', selector: '[class*=private]' },
    },
  },
  thumbImg: {
    selector: 'data-original',
  },
  gropeStrategy: 'all-in-all',
  customDataSelectorFns: [
    'filterInclude',
    'filterExclude',
    'filterDuration',
    {
      filterPrivate: (e, state) => (state.filterPrivate && e.private) as boolean,
    },
    {
      filterPublic: (e, state) => (state.filterPublic && !e.private) as boolean,
    },
  ],
  schemeOptions: [
    'Text Filter',
    'Duration Filter',
    'Privacy Filter',
    'Badge',
    {
      title: 'Advanced',
      content: [
        {
          autoRequestAccess: false,
          label: 'auto send friend request on check access',
        },
      ],
    },
  ],
  animatePreview,
});

function animatePreview(container: HTMLElement) {
  const tick = new Tick(500);

  function killjquery(n = 10) {
    if (n > 0) {
      n--;
      $('img[data-cnt]').off();
      setTimeout(() => killjquery(n), 250);
    }
  }

  killjquery();

  function rotateImg(src: string, count: number) {
    return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
  }

  OnHover.create(
    container,
    '.list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)',
    (e) => {
      const img = e.querySelector('img') as HTMLImageElement;
      const origin = img.src;
      const count = parseInt(img.getAttribute('data-cnt') as string) || 5;
      tick.start(
        () => {
          img.src = rotateImg(img.src, count);
        },
        () => {
          img.src = origin;
        },
      );
      return () => tick.stop();
    },
  );
}

//====================================================================================================

const createDownloadButton = () =>
  downloader({
    append: '.tabs-menu > ul',
    after: '',
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

async function friendRequest(id: string) {
  const url = Number.isInteger(id) ? `${location.origin}/members/${id}/` : id;
  await fetch(url, { body: DEFAULT_FRIEND_REQUEST_FORMDATA, method: 'post' });
}

function getMemberLinks(e: HTMLElement) {
  return Array.from(
    e?.querySelectorAll<HTMLAnchorElement>('.item > a') || [],
    (l) => l.href,
  ).filter((l) => /\/members\/\d+\/$/.test(l));
}

async function getMemberFriends(id: number | string) {
  const url = new URL(
    IS_COMMUNITY_LIST ? '/members/' : `/members/${id}/friends/`,
    location.origin,
  );

  const doc = (await fetchHtml(url.href)) as unknown as Document;

  const paginationStrategy = getPaginationStrategy({
    doc,
    url,
    overwritePaginationLast: (x: number) => (x === 9 ? 999 : x),
  });

  const gen = InfiniteScroller.generatorForPaginationStrategy(paginationStrategy);

  for (const url in gen) {
    const doc = await fetchHtml(url);
    getMemberLinks(doc).forEach((a) => {
      const id = a.match(/\d+/)?.[0] as string;
      lskdb.setKey(id);
    });
  }

  await processFriendship();
}

let processFriendshipStarted = false;
async function processFriendship(batchSize = 1, interval = 5000) {
  if (lskdb.isLocked()) return;
  const friendlist = lskdb.getKeys(batchSize);
  if (friendlist?.length < 1) return;
  if (!processFriendshipStarted) {
    processFriendshipStarted = true;
    console.log('processFriendshipStarted');
  }
  lskdb.lock(true);
  const urls = friendlist.map((id) => `${location.origin}/members/${id}/`);
  for (const url of urls) {
    await wait(interval);
    await friendRequest(url);
  }
  lskdb.lock(false);
  await processFriendship();
}

function createPrivateVideoFriendButton() {
  if (!document.querySelector('.no-player')) return;
  const member = document.querySelector<HTMLAnchorElement>('.no-player a')?.href as string;
  const button = parseHtml(
    '<button class="friend-button"><span>Friend Request</span></button>',
  );
  document.querySelector('.no-player .message')?.append(button);
  button.addEventListener('click', () => friendRequest(member), { once: true });
}

function createFriendButton() {
  const button = parseHtml(
    '<a href="#friend_everyone" class="button friend-button"><span>Friend Everyone</span></a>',
  );
  document.querySelector('.main-container-user > .headline, .headline')?.append(button);
  const memberid = location.pathname.match(/\d+/)?.[0] as string;
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
  setTimeout(processFriendship, 5000);
}

async function checkPrivateVidsAccess() {
  const checkAccess = async (item: HTMLElement) => {
    const videoURL = (item.firstElementChild as HTMLAnchorElement).href as string;
    const doc = await fetchHtml(videoURL);

    if (!doc.querySelector('.player')) return;

    const haveAccess = !doc.querySelector('.no-player');

    if (!haveAccess && rules.store.state.autoRequestAccess) {
      const anchor = doc.querySelector<HTMLAnchorElement>('.message a');
      const uid = anchor?.href.match(/\d+/)?.at(-1) as string;
      lskdb.setKey(uid);
    }

    item.classList.add(haveAccess ? 'haveAccess' : 'haveNoAccess');
  };

  const thumbs = document.querySelectorAll<HTMLElement>(
    '.item.private:not(.haveAccess,.haveNoAccess)',
  );

  for (const thumb of thumbs) {
    await checkAccess(thumb);
  }
}

//====================================================================================================

function getUserInfo(e: HTMLElement) {
  const uploadedCount = querySelectorLastNumber('#list_videos_uploaded_videos strong', e);
  const friendsCount = querySelectorLastNumber('#list_members_friends .headline', e);
  return { uploadedCount, friendsCount };
}

async function acceptFriendRequest(id: number | string) {
  const url = new URL(`/my/messages/${id}/`, location.origin);
  const memberUrl = new URL(`/members/${id}/`, location.origin);
  await fetch(url, {
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: `action=confirm_add_to_friends&message_from_user_id=${id}&function=get_block&block_id=list_messages_my_conversation_messages&confirm=Confirm&format=json&mode=async`,
    method: 'POST',
  });
  await fetchHtml(memberUrl).then((doc) =>
    console.log('userInfo', memberUrl.href, getUserInfo(doc)),
  );
}

async function clearMessages() {
  const pages = InfiniteScroller.generatorForPaginationStrategy(
    getPaginationStrategy({
      overwritePaginationLast: (x: number) => (x === 9 ? 999 : x),
    }),
  );

  for await (const p of pages) {
    const doc = await fetchHtml(p.url);

    const messages = Array.from(
      doc.querySelectorAll<HTMLAnchorElement>(
        '#list_members_my_conversations_items .item > a',
      ) || [],
    ).map((a) => a.href);

    for (const m of messages) {
      await checkMessageHistory(m);
    }
  }

  async function deleteMessage(url: string, id: string) {
    const deleteURL = `${url}?mode=async&format=json&function=get_block&block_id=list_messages_my_conversation_messages&action=delete_conversation&conversation_user_id=${id}`;
    await fetch(deleteURL);
  }

  async function getConversation(url: string) {
    const doc = await fetchHtml(url);
    const hasFriendRequest = !!doc.querySelector('input[value=confirm_add_to_friends]');
    const originalText = querySelectorText(doc, '.original-text');
    const id = url.match(/\d+/)?.[0] as string;
    const messages = querySelectorText(doc, '.list-messages');
    return {
      id,
      hasFriendRequest,
      originalText,
      messages,
    };
  }

  async function checkMessageHistory(url: string) {
    const { originalText, hasFriendRequest, id, messages } = await getConversation(url);
    if (!(originalText || hasFriendRequest)) {
      await deleteMessage(url, id);
    } else {
      console.log({ originalText, url, messages });
      if (hasFriendRequest) {
        await acceptFriendRequest(id);
      }
    }
  }
}

//====================================================================================================

const FRIEND_REQUEST_INTERVAL = 5000;

if (IS_LOGGED_IN) {
  setTimeout(processFriendship, FRIEND_REQUEST_INTERVAL);
  if (IS_MEMBER_PAGE || IS_COMMUNITY_LIST) {
    createFriendButton();
  }
}

if (IS_VIDEO_PAGE) {
  createDownloadButton();
  createPrivateVideoFriendButton();
}

if (IS_MESSAGES) {
  const button = parseHtml('<button>clear messages</button>');
  document.querySelector('.headline')?.append(button);
  button.addEventListener('click', clearMessages);
}

rules.store.eventSubject.subscribe((event) => {
  if (event.includes('check access')) {
    requestAccess();
  }
});
