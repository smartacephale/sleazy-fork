import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addElement, unsafeWindow } from '$';
import { Rules } from '../../core';
import {
  exterminateVideo,
  fetchJson,
  instantiateTemplate,
  Observer,
  OnHover,
  parseHtml,
  waitForElementToAppear,
  watchElementChildrenCount,
} from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Xhamster Improved',
  version: '5.0.2',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: ['https://*.xhamster.com/*', 'https://*.xhamster.*/*'],
  exclude: 'https://*.xhamster.com/embed*',
  grant: ['GM_addElement', 'GM_addStyle', 'unsafeWindow'],
};

const IS_VIDEO_PAGE = /^\/videos|moments\//.test(location.pathname);
const IS_PLAYLIST = /^\/my\/favorites\/videos\/\w+/.test(location.pathname);

function createThumb(data: Record<string, string>): string {
  const attrsToReplace = {
    href: data.pageURL,
    'data-previewvideo': data.trailerURL,
    'data-previewvideo-fallback': data.trailerFallbackUrl,
    'data-sprite': data.spriteURL,
    title: data.title,
    'data-video-id': data.id,
    srcset: data.thumbURL,
    src: data.imageURL,
  };

  const text = {
    '.video-thumb-views': data.views,
    '[title]': data.title,
    '[data-role="video-duration"] div': data.duration,
  };

  return instantiateTemplate('.video-thumb', attrsToReplace, text);
}

const getPaginationData: Rules['getPaginationData'] = !IS_PLAYLIST
  ? undefined
  : async (url: string): Promise<HTMLElement> => {
      const data = await fetchJson(url);
      const thumbsHtml = (data as any).list
        .map((e: Record<string, string>) => createThumb(e))
        .join('\n');
      return parseHtml(`<div>${thumbsHtml}</div>`);
    };

function createPlaylistPaginationStrategy() {
  const collectionId = location.pathname
    .split('/my/favorites/videos/')[1]
    .split('-')[0] as string;
  const data = (unsafeWindow as any).initials;
  const paginationLast = data.favoritesVideoPaging.maxPages;
  const paginationOffset = data.favoritesVideoPaging.active;

  const playlistPaginationStrategy: Rules['paginationStrategyOptions'] = {
    paginationSelector: 'nav[class *= "pagination"]',
    getPaginationLast: () => paginationLast,
    getPaginationOffset: () => paginationOffset,
    getPaginationUrlGenerator: () => (offset: number) => {
      return `https://xhamster.com/api/front/favorite/get-playlist?id=${collectionId}&perPage=60&page=${offset}`;
    },
  };

  return playlistPaginationStrategy;
}

const paginationStrategyOptionsDefault: Rules['paginationStrategyOptions'] = {
  paginationSelector: '.prev-next-list, .test-pager',
};

const paginationStrategyOptions = IS_PLAYLIST
  ? createPlaylistPaginationStrategy()
  : paginationStrategyOptionsDefault;

const rules = new Rules({
  paginationStrategyOptions,
  getPaginationData,
  containerSelectorLast: '.thumb-list',
  thumbs: { selector: '.video-thumb' },
  thumb: {
    selectors: {
      title: '.video-thumb-info__name,.video-thumb-info>a',
      duration: '.thumb-image-container__duration',
      watched: {
        type: 'boolean',
        selector: '[data-role="video-watched',
      },
    },
  },
  thumbImg: {
    strategy: 'auto',
    remove: '[loading]',
  },
  gropeStrategy: 'all-in-all',
  customDataSelectorFns: [
    'filterInclude',
    'filterExclude',
    'filterDuration',
    {
      filterWatched: (el, state) => !!(state.filterWatched && el.watched),
    },
    {
      filterUnwatched: (el, state) => !!(state.filterUnwatched && !el.watched),
    },
  ],
  schemeOptions: [
    'Text Filter',
    'Badge',
    {
      title: 'Filter Watched',
      content: [
        { filterWatched: false, label: 'watched' },
        { filterUnwatched: false, label: 'unwatched' },
      ],
    },
    'Duration Filter',
    'Advanced',
  ],
  animatePreview,
});

function animatePreview() {
  function createPreviewVideoElement(src: string, mount: HTMLElement) {
    const video = GM_addElement('video', {
      playsInline: true,
      autoplay: true,
      loop: true,
      class: 'thumb-image-container__video',
      src,
    });

    video.addEventListener(
      'loadeddata',
      () => {
        mount.before(video);
      },
      false,
    );
    return () => exterminateVideo(video);
  }

  OnHover.create(
    document.body,
    (e) => e.classList.contains('thumb-image-container__image'),
    (e) => {
      const videoSrc = e.parentElement?.getAttribute('data-previewvideo') as string;
      const onOverCallback = createPreviewVideoElement(videoSrc, e);
      const leaveTarget = e.parentElement?.parentElement as HTMLElement;
      return { leaveTarget, onOverCallback };
    },
  );
}

function expandMoreVideoPage() {
  watchElementChildrenCount(rules.container, () => setTimeout(rules.gropeInit, 1800));
  waitForElementToAppear(document.body, 'button[data-role="show-more-next"]', (el) => {
    const observer = new Observer((target) => {
      (target as HTMLButtonElement).click();
    });
    observer.observe(el);
  });
}

if (IS_VIDEO_PAGE) {
  expandMoreVideoPage();
}
