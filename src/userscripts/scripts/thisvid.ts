import { from } from 'ix/asynciterable';
import { concatMap, flatMap, map, takeWhile } from 'ix/asynciterable/operators';
import { LSKDB } from 'lskdb';
import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addStyle, unsafeWindow } from '$';
import { getPaginationStrategy, InfiniteScroller, RulesGlobal } from '../../core';
import {
  circularShift,
  downloader,
  fetchHtml,
  getCommonParents,
  objectToFormData,
  onPointerOverAndLeave,
  parseCssUrl,
  parseHtml,
  querySelectorLastNumber,
  range,
  replaceElementTag,
  Tick,
} from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'ThisVid.com Improved',
  version: '8.0.0',
  description:
    'Infinite scroll [optional]. Preview for private videos. Filter: title, duration, public/private. Check access to private vids. Mass friend request button. Sorts messages. Download button 📼',
  match: ['https://*.thisvid.com/*'],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=thisvid.com',
};

const $ = (unsafeWindow as any).$;

type RulesConfig = ConstructorParameters<typeof RulesGlobal>[0];

const lskdb = new LSKDB();

const IS_MEMBER_PAGE = /^\/members\/\d+\/$/.test(location.pathname);
const IS_MESSAGES_PAGE = /^\/my_messages\//.test(location.pathname);
const IS_PLAYLIST = /^\/playlist\/\d+\//.test(location.pathname);
const IS_VIDEO_PAGE = /^\/videos\//.test(location.pathname);
const IS_MY_WALL = /^\/my_wall\//.test(location.pathname);
const MY_ID = (document.querySelector('[target="_self"]') as HTMLAnchorElement)?.href.match(
  /\/(\d+)\//,
)?.[1];
const LOGGED_IN = !!MY_ID;
const IS_MY_MEMBER_PAGE =
  LOGGED_IN && !!document.querySelector('.my-avatar') && IS_MEMBER_PAGE;
const IS_OTHER_MEMBER_PAGE = !IS_MY_MEMBER_PAGE && IS_MEMBER_PAGE;
const IS_MEMBER_FRIEND =
  IS_OTHER_MEMBER_PAGE &&
  (document.querySelector('.case-left') as HTMLElement)?.innerText.includes(
    'is in your friends',
  );

function fixPlaylistThumbUrl(src: string) {
  return src.replace(/playlist\/\d+\/video/, () => 'videos');
}

const defaultRulesConfig: RulesConfig = {
  thumbsSelector:
    'div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder',
  getThumbImgData(thumb: HTMLElement) {
    const img = thumb.querySelector('img') as HTMLImageElement;
    const privateThumb = thumb.querySelector('.private') as HTMLElement;

    let imgSrc = img?.getAttribute('data-original') as string;

    if (privateThumb) {
      imgSrc = parseCssUrl(privateThumb.style.background);
      privateThumb.removeAttribute('style');
    }

    img.removeAttribute('data-original');
    img.removeAttribute('data-cnt');
    img.classList.remove('lazy-load');

    return { img, imgSrc };
  },
  containerSelectorLast: '.thumbs-items',
  titleSelector: '.title',
  durationSelector: '.duration',
  customThumbDataSelectors: {
    private: { selector: '.private', type: 'boolean' },
    hd: { selector: '.quality', type: 'boolean' },
    views: { selector: '.view', type: 'number' },
  },
  animatePreview,
  customDataSelectorFns: [
    'filterInclude',
    'filterExclude',
    'filterDuration',
    {
      filterPrivate: (el, state) => (state.filterPrivate && el.private) as boolean,
    },
    {
      filterPublic: (el, state) => (state.filterPublic && !el.private) as boolean,
    },
    {
      filterHD: (el, state) => (state.filterHD && !el.hd) as boolean,
    },
    {
      filterNonHD: (el, state) => (state.filterNonHD && el.hd) as boolean,
    },
  ],
  schemeOptions: [
    'Text Filter',
    'Duration Filter',
    'Privacy Filter',
    {
      title: 'HD Filter',
      content: [
        { filterHD: false, label: 'hd' },
        { filterNonHD: false, label: 'non-hd' },
      ],
    },
    'Badge',
    {
      title: 'Advanced',
      content: [{ autoRequestAccess: false, label: 'check access sends friend requests' }],
    },
  ],
  gropeStrategy:
    getCommonParents([
      ...document.querySelectorAll<HTMLElement>(
        'div:has(> .tumbpu[title]):not(.thumbs-photo) > .tumbpu[title], .thumb-holder',
      ),
    ]).length < 2
      ? 'all-in-one'
      : 'all-in-all',
};

const config: RulesConfig =
  IS_MY_MEMBER_PAGE || IS_MY_WALL ? await createPrivateFeed() : defaultRulesConfig;

const rules = new RulesGlobal(config);

GM_addStyle(`
  .haveNoAccess { background: linear-gradient(to bottom, #b50000 0%, #2c2c2c 100%) red !important; }
  .haveAccess { background: linear-gradient(to bottom, #4e9299 0%, #2c2c2c 100%) green !important; }
  .success { background: linear-gradient(#2f6eb34f, #66666647) !important; }
  .failure { background: linear-gradient(rgba(179, 47, 47, 0.31), rgba(102, 102, 102, 0.28)) !important; }
  .friend-button { background: radial-gradient(#5ccbf4, #e1ccb1) !important; }
  .friendProfile { background: radial-gradient(circle, rgb(28, 42, 50) 48%, rgb(0, 0, 0) 100%) !important; }
  `);

//====================================================================================================

function friend(id: string, message = '') {
  return fetch(
    `https://thisvid.com/members/${id}/?action=add_to_friends_complete&function=get_block&block_id=member_profile_view_view_profile&format=json&mode=async&message=${message}`,
  );
}

function acceptFriendship(id: string | number) {
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

async function getMemberFriends(
  memberId: string,
  by?: 'activity' | 'popularity',
): Promise<AsyncGenerator<string>> {
  const { friendsCount } = await getMemberData(memberId);
  const offset = Math.ceil(friendsCount / 24);

  let friendsURL = `https://thisvid.com/members/${memberId}/friends/`;
  if (by === 'activity') friendsURL = 'https://thisvid.com/my_friends_by_activity/';
  if (by === 'popularity') friendsURL = 'https://thisvid.com/my_friends_by_popularity/';

  async function* g() {
    for (const o of range(offset)) {
      const html = await fetchHtml(`${friendsURL}${o}/`);
      for await (const id of getMembers(html)) {
        yield id;
      }
    }
  }

  return g();
}

function getMembers(el: HTMLElement) {
  const friendsList = el.querySelector('#list_members_friends_items') || el;
  return Array.from(friendsList.querySelectorAll<HTMLAnchorElement>('.tumbpu') || [])
    .map((e) => e.href.match(/\d+/)?.[0] as string)
    .filter((_) => _);
}

async function friendMemberFriends(orientationFilter?: string) {
  const memberId = window.location.pathname.match(/\d+/)?.[0] as string;
  friend(memberId);
  const friends = await getMemberFriends(memberId);

  await from(friends)
    .pipe(
      flatMap(async (fid: string) => {
        if (!orientationFilter) {
          await friend(fid);
        } else {
          const { orientation, uploadedPrivate } = await getMemberData(fid);
          if (
            uploadedPrivate > 0 &&
            (orientation === orientationFilter ||
              (orientationFilter === 'Straight' && orientation === 'Lesbian'))
          ) {
            await friend(fid);
          }
        }
      }, 60),
    )
    .forEach(() => {});
}

function initFriendship() {
  GM_addStyle(
    '.buttons {display: flex; flex-wrap: wrap} .buttons button, .buttons a {align-self: center; padding: 4px; margin: 5px;}',
  );

  const buttons = [
    { color: '#ff7194', orientation: undefined },
    { color: '#ba71ff', orientation: 'Straight' },
    { color: '#46baff', orientation: 'Gay' },
    { color: '#4ebaaf', orientation: 'Bisexual' },
  ] as const;

  buttons.forEach((b) => {
    const button = parseHtml(
      `<button style="background: radial-gradient(red, ${b.color});">friend ${b.orientation || 'everyone'}</button>`,
    );
    document.querySelector('.buttons')?.append(button);
    button.addEventListener('click', (e: PointerEvent) => handleClick(e, b.orientation), {
      once: true,
    });
  });

  function handleClick(e: PointerEvent, orientationFilter?: string) {
    const button = e.target as HTMLElement;
    button.style.background = 'radial-gradient(#ff6114, #5babc4)';
    button.innerText = 'processing requests';
    friendMemberFriends(orientationFilter).then(() => {
      button.style.background = 'radial-gradient(blue, lightgreen)';
      button.innerText = 'friend requests sent';
    });
  }
}

//====================================================================================================

type MemberData = {
  uploadedPublic: number;
  uploadedPrivate: number;
  name: string;
  friendsCount: number;
  orientation: string;
};

async function getMemberData(id: string) {
  const url = id.includes('member') ? id : `/members/${id}/`;
  const doc = await fetchHtml(url);
  const data: Partial<MemberData> = {};

  doc.querySelectorAll<HTMLElement>('.profile span').forEach((s) => {
    if (s.innerText.includes('Name:')) {
      data.name = (s.firstElementChild as HTMLElement)?.innerText as string;
    }
    if (s.innerText.includes('Orientation:')) {
      data.orientation = (s.firstElementChild as HTMLElement)?.innerText as string;
    }
  });

  data.uploadedPublic = querySelectorLastNumber(
    '.headline:has(+ #list_videos_public_videos_items) span',
    doc,
  );
  data.uploadedPrivate = querySelectorLastNumber(
    '.headline:has(+ #list_videos_private_videos_items) span',
    doc,
  );
  data.friendsCount = querySelectorLastNumber('#list_members_friends span', doc);

  return data as MemberData;
}

//====================================================================================================

function requestAccessVideoPage() {
  const holder = document.querySelector('.video-holder > p');
  if (holder) {
    const uploader = (document.querySelector('a.author') as HTMLAnchorElement).href
      .match(/\d+/)
      ?.at(-1);
    const button = parseHtml(
      `<button onclick="requestPrivateAccess(event, ${uploader}); this.onclick=null;">Friend Request</button>`,
    );
    holder.parentElement?.append(button);
  }
}

const requestPrivateAccess = (e: PointerEvent, memberid: string) => {
  e.preventDefault();
  friend(memberid, '');
  (e.target as HTMLElement).innerText = (e.target as HTMLElement).innerText.replace(
    '🚑',
    '🍆',
  );
};

async function checkPrivateVideoAccess(url: string) {
  const html = await fetchHtml(url);
  const holder = html.querySelector('.video-holder > p');

  const access = !holder;

  const uploaderEl = (
    holder ? holder.querySelector('a') : html.querySelector('a.author')
  ) as HTMLAnchorElement;
  const uploaderURL = uploaderEl.href.match(/\d+/)?.at(-1) as string;
  const uploaderName = uploaderEl.innerText;

  return {
    access,
    uploaderURL,
    uploaderName,
  };
}

function getUncheckedPrivateThumbs(html = document) {
  return [
    ...html.querySelectorAll<HTMLAnchorElement | HTMLElement>(
      '.tumbpu:has(.private):not(.haveNoAccess,.haveAccess), .thumb-holder:has(.private):not(.haveNoAccess,.haveAccess)',
    ),
  ];
}

const uploadersChecked = new Set();

async function requestAccess() {
  const checkAccess = async (thumb: HTMLElement | HTMLAnchorElement) => {
    const url = (thumb.querySelector('a')?.href ||
      (thumb as HTMLAnchorElement)?.href) as string;
    const { access, uploaderURL } = await checkPrivateVideoAccess(url);

    thumb.classList.add(access ? 'haveAccess' : 'haveNoAccess');
    if (access) return;

    if (rules.store.state.autoRequestAccess && !uploadersChecked.has(uploaderURL)) {
      acceptFriendship(uploaderURL);
      friend(uploaderURL);
    }
  };

  for (const t of getUncheckedPrivateThumbs()) {
    await checkAccess(t);
  }
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

function animatePreview(_: HTMLElement) {
  const tick = new Tick(750);
  $('img[alt!="Private"]').off();

  function iteratePreviewFrames(img: HTMLImageElement) {
    img.src = (img.getAttribute('src') as string).replace(
      /(\d+)(?=\.jpg$)/,
      (_, n) => `${circularShift(parseInt(n), 6)}`,
    );
  }

  function animate(container: HTMLElement) {
    onPointerOverAndLeave(
      container,
      (target) => !!target.getAttribute('src'),
      (target) => {
        const e = target as HTMLImageElement;
        const orig = target.getAttribute('src') as string;
        tick.start(
          () => iteratePreviewFrames(e),
          () => {
            e.src = orig;
          },
        );
      },
      () => tick.stop(),
    );
  }

  animate(document.querySelector('.content') || document.body);
}

//====================================================================================================

async function getMemberVideos(id: string, type = 'private') {
  const { uploadedPrivate, uploadedPublic, name } = await getMemberData(id);
  const videosCount = type === 'private' ? uploadedPrivate : uploadedPublic;

  const url = new URL(`https://thisvid.com/members/${id}/${type}_videos/`);
  const doc = (await fetchHtml(url.href)) as unknown as Document;

  const paginationStrategy = getPaginationStrategy({ doc, url });

  const memberVideosGenerator =
    InfiniteScroller.generatorForPaginationStrategy(paginationStrategy);

  return { name, videosCount, memberVideosGenerator };
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

  const fragment = document.createDocumentFragment();
  links.forEach(({ hov, text }) => {
    const button = parseHtml(
      `<li><a style="color: lightblue;" href="https://thisvid.com/my_wall/${hov}" class="selective"><i class="ico-arrow"></i>${text}</a></li>`,
    );
    fragment.append(button);
  });

  container.append(fragment);
}

async function createPrivateFeed() {
  createPrivateFeedButton();
  if (!location.hash.includes('feed')) return defaultRulesConfig;
  const isPubKey = window.location.hash.includes('public_feed') ? 'public' : 'private';
  const sortByFeed = window.location.hash.includes('activity')
    ? 'activity'
    : window.location.hash.includes('popularity')
      ? 'popularity'
      : undefined;

  const container = parseHtml('<div class="thumbs-items"></div>');
  const ignored = parseHtml('<div class="ignored"><h2>IGNORED:</h2></div>');

  const containerParent = document.querySelector(
    '.main > .container > .content',
  ) as HTMLElement;
  containerParent.innerHTML = '';
  containerParent?.nextElementSibling?.remove();
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

  const { friendsCount } = await getMemberData(MY_ID as string);

  class FeedGenerator {
    private offset = 0;
    private minVideoCount = 1;

    public skip(n: number) {
      this.offset += n;
    }

    public filterMinVideoCount(n: number) {
      this.minVideoCount = n;
    }

    constructor(
      private id: string,
      private memberGeneratorCallback?: (
        name: string,
        videosCount: number,
        id: string,
      ) => void,
      private type = 'private',
      private by: Parameters<typeof getMemberFriends>[1] = undefined,
    ) {}

    public async *consume() {
      const membersIds = await getMemberFriends(this.id, this.by);

      const stream = from(membersIds).pipe(
        concatMap(async (mid, index) => {
          if (index < this.offset) return from([]);
          this.offset = index;

          const { memberVideosGenerator, name, videosCount } = await getMemberVideos(
            mid,
            this.type,
          );

          if (lskdb.hasKey(mid) || videosCount < this.minVideoCount) return from([]);

          this.memberGeneratorCallback?.(name, videosCount, mid);

          return from(memberVideosGenerator).pipe(
            takeWhile(() => index >= this.offset),
            map(async (element) => ({ url: element.url, offset: index })),
          );
        }),
      );

      yield* stream;
    }
  }

  const feedGenerator = new FeedGenerator(
    MY_ID as string,
    (name: string, videosCount: number, id: string) => {
      if (container.querySelector(`#mem-${id}`)) return;
      container.append(
        parseHtml(`
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

  const ignoredMembers = lskdb.getAllKeys();
  ignoredMembers.forEach((im) => {
    document
      .querySelector('.ignored')
      ?.append(
        parseHtml(`<button id="#ir-${im}" onClick="unignore(event)">${im} 🗡</button>`),
      );
  });

  const skip = (n: number) => {
    feedGenerator.skip(n);
    (document.querySelector('.thumbs-items') as HTMLElement).innerHTML = '';
  };

  const hideMemberVideos = (e: PointerEvent, ignore = true) => {
    const container = (e.target as HTMLElement)?.closest('div') as HTMLElement;
    let id = container.id;

    const videosCount = querySelectorLastNumber(`#${id}`);
    document
      .querySelectorAll<HTMLElement>(`#${id}~a`)
      .values()
      .take(videosCount)
      .forEach((e) => {
        e.remove();
      });
    container.remove();

    id = id.slice(4);
    if (ignore) {
      const btn = parseHtml(
        `<button id="irm-${id}" onClick="unignore(event)">${id} X</button>`,
      );
      document.querySelector('.ignored')?.append(btn);
      lskdb.setKey(id);
    }
  };

  const unignore = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    const id = target.id.slice(4);
    lskdb.removeKey(id);
    target.remove();
  };

  const filterMinVideoCount = (n: number) => feedGenerator.filterMinVideoCount(n);

  Object.assign(unsafeWindow, { unignore, hideMemberVideos });

  const customGenerator = await feedGenerator.consume();

  const rulesConfig: RulesConfig = Object.assign(defaultRulesConfig, {
    containerSelector: () => container,
    intersectionObservableSelector: '.footer',
    customGenerator,
    paginationStrategyOptions: {
      getPaginationLast: () => friendsCount,
      paginationSelector: '.footer',
    },
    schemeOptions: [
      'Text Filter',
      'Duration Filter',
      'Privacy Filter',
      'Badge',
      {
        title: 'Feed Controls',
        content: [
          { 'skip 10': () => skip(10) },
          { 'skip 100': () => skip(100) },
          { 'skip 1000': () => skip(1000) },
          { 'filter >10': () => filterMinVideoCount(10) },
          { 'filter >25': () => filterMinVideoCount(25) },
          { 'filter >100': () => filterMinVideoCount(100) },
        ],
      },
      'Advanced',
    ],
  } as RulesConfig);

  return rulesConfig;
}

//====================================================================================================

function deleteMsg(id: string) {
  fetch(
    `https://thisvid.com/my_messages/inbox/?mode=async&format=json&action=delete&function=get_block&block_id=list_messages_my_conversation_messages&delete[]=${id}`,
  );
}

async function clearMessages() {
  const sortMsgs = (doc: Document | HTMLElement) => {
    doc.querySelectorAll<HTMLElement>('.entry').forEach((e) => {
      const id = e.querySelector<HTMLInputElement>('input[name="delete[]"]')
        ?.value as string;
      const msg = e.querySelector<HTMLElement>('.user-comment')?.innerText as string;

      if (/has confirmed|declined your|has removed/g.test(msg)) deleteMsg(id);
    });
  };

  await Promise.all(
    Array.from({ length: rules.paginationStrategy.getPaginationLast() }, (_, i) =>
      fetchHtml(`https://thisvid.com/my_messages/inbox/${i + 1}/`).then((html) =>
        sortMsgs(html),
      ),
    ),
  );
}

function clearMessagesButton() {
  const btn = parseHtml('<button>clear messages</button>');
  btn.addEventListener('click', clearMessages);
  document.querySelector('.headline')?.append(btn);
}

function highlightMessages() {
  document.querySelectorAll<HTMLElement>('.entry').forEach((entry) => {
    const memberUrl = entry.querySelector<HTMLAnchorElement>('a')?.href as string;
    getMemberData(memberUrl).then(({ uploadedPublic, uploadedPrivate }) => {
      if (uploadedPrivate > 0) {
        const success = !entry.innerText.includes('has declined');
        entry.classList.add(success ? 'success' : 'failure');
      }
      (entry.querySelector('.user-comment p') as HTMLElement).innerText +=
        `  |  videos: ${uploadedPublic} public, ${uploadedPrivate} private`;
    });
  });
}

//====================================================================================================

if (LOGGED_IN) {
  rules.store.eventSubject.subscribe((x) => {
    if (x.includes('check access')) {
      requestAccess();
    }
  });
}

if (IS_MESSAGES_PAGE) {
  clearMessagesButton();
  highlightMessages();
}

if (IS_VIDEO_PAGE) {
  requestAccessVideoPage();
  createDownloadButton();
}

if (IS_OTHER_MEMBER_PAGE) {
  initFriendship();
}

Object.assign(unsafeWindow, { requestPrivateAccess });

if (IS_MEMBER_FRIEND) {
  document.querySelector('.profile')?.classList.add('friendProfile');
}

if (IS_PLAYLIST) {
  const videoUrl = fixPlaylistThumbUrl(location.pathname) as string;
  const desc = document.querySelector(
    '.tools-left > li:nth-child(4) > .title-description',
  ) as HTMLElement;
  const link = replaceElementTag(desc, 'a') as HTMLAnchorElement;
  link.href = videoUrl;
}
