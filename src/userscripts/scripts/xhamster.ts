import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addElement, unsafeWindow } from '$';
import { Rules } from '../../core';
import {
  exterminateVideo,
  findProperty,
  instantiateTemplate,
  OnHover,
  // watchDomChangesWithThrottle,
} from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Xhamster PervertMonkey',
  version: '5.1.1',
  description:
    'Infinite scroll [optional], Filter by Title, Duration and Watched/Unwatched. Sort by Duration and Views',
  match: ['https://*.xhamster.com/*', 'https://*.xhamster.*/*'],
  exclude: 'https://*.xhamster.com/embed*',
  grant: ['GM_addElement', 'GM_addStyle', 'unsafeWindow'],
};

// const IS_VIDEO_PAGE = /^\/videos|moments\//.test(location.pathname);
const IS_PLAYLIST = /^\/my\/favorites\/videos\/\w+/.test(location.pathname);

function createThumb(data: Record<string, string>): HTMLElement {
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

  return instantiateTemplate('[data-video-type="video"].video-thumb', attrsToReplace, text);
}

const getPaginationData: Rules['getPaginationData'] = !IS_PLAYLIST
  ? undefined
  : async (url: string): Promise<HTMLElement> => {
    const data = await fetch(url, {
      headers: {
        'x-csrf-token': '1',
      }
    }).then(r => r.json());

    const thumbsHtml = (data as any).list
      .map((e: Record<string, string>) => createThumb(e)) as HTMLElement[];

    const wrapper = document.createElement('div');
    wrapper.append(...thumbsHtml);

    return wrapper;
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
      return `https://xhamster.com/api/front/favorite/get-playlist?id=${collectionId}&page=${offset}`;
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

const initialsCache = new Map<string, any>();

function getInitials(document: Document): any {
  const url = (document as any).sourceURL;

  return initialsCache.getOrInsertComputed(url, () => {
    initialsCache.clear();

    const initialsScript = Array.from(document.scripts).find(
      (s) => s.id === 'initials-script',
    )?.innerHTML;

    if (!initialsScript?.length) return {};

    const initials = JSON.parse(
      initialsScript.substring('window.initials='.length, initialsScript.length - 1),
    );

    return findProperty(initials, 'videoThumbProps');
  });
}

const rules = new Rules({
  paginationStrategyOptions,
  getPaginationData,
  containerSelectorLast: '.thumb-list',
  thumbs: {
    selector: '[data-video-type="video"].video-thumb',
    transform: (t, document) => {
      try {
        if (!t.querySelector('[class*=placeholderSkeleton]') || !document) return;

        const tid = Number.parseInt(t.getAttribute('data-video-id') || '');
        const cache = getInitials(document);

        const data = cache.find((i: any) => i.id === tid);

        if (data) {
          const replacement = createThumb(data);
          t.innerHTML = replacement.innerHTML;
        }
      } catch (_) { }
    },
  },
  thumb: {
    selectors: {
      title: '.video-thumb-info__name,.video-thumb-info>a',
      duration: '.thumb-image-container__duration',
      watched: { selector: '[data-role="video-watched', type: 'boolean' },
      views: { selector: '.video-thumb-views', type: 'float' },
    },
  },
  thumbImg: {
    strategy: 'auto',
    remove: '[loading]',
  },
  gropeStrategy: 'all-in-all',
  customDataFilterFns: [
    {
      filterWatched: (e, state) => !!(state.filterWatched && e.watched),
    },
    {
      filterUnwatched: (e, state) => !!(state.filterUnwatched && !e.watched),
    },
  ],
  schemeOptions: [
    'Title Filter',
    {
      title: 'Filter Watched',
      content: [
        { filterWatched: false, label: 'watched' },
        { filterUnwatched: false, label: 'unwatched' },
      ],
    },
    'Sort By',
    'Duration Filter',
    'Badge',
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

  OnHover.create(document.body, '.video-thumb', (e) => {
    const container = e.querySelector('.thumb-image-container__image') as HTMLElement;
    const videoSrc = e
      .querySelector('[data-previewvideo]')
      ?.getAttribute('data-previewvideo') as string;
    return createPreviewVideoElement(videoSrc, container);
  });
}

// if (IS_VIDEO_PAGE) {
//   watchDomChangesWithThrottle(rules.container, () => {
//     rules.reset();
//   }, 1000, 10);
// }
