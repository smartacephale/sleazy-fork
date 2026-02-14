import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { RulesGlobal } from '../../core/rules';
import {
  exterminateVideo,
  getCommonParents,
  instantiateTemplate,
  parseHtml,
  waitForElementToAppear,
  watchElementChildrenCount,
} from '../../utils/dom';
import { onPointerOverAndLeave } from '../../utils/events';
import { fetchJson } from '../../utils/fetch';
import { Observer } from '../../utils/observers';

export const meta: MonkeyUserScript = {
  name: 'Xhamster Improved',
  version: '5.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: ['https://*.xhamster.*/*', 'https://*.xhamster.com/*'],
  exclude: 'https://*.xhamster.com/embed*',
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=xhamster.com',
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

const getPaginationData: RulesGlobal['getPaginationData'] = !IS_PLAYLIST
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

  const playlistPaginationStrategy: RulesGlobal['paginationStrategyOptions'] = {
    paginationSelector: 'nav[class *= "pagination"]',
    getPaginationLast: () => paginationLast,
    getPaginationOffset: () => paginationOffset,
    getPaginationUrlGenerator: () => (offset: number) => {
      return `https://xhamster.com/api/front/favorite/get-playlist?id=${collectionId}&perPage=60&page=${offset}`;
    },
  };

  return playlistPaginationStrategy;
}

const paginationStrategyOptionsDefault: RulesGlobal['paginationStrategyOptions'] = {
  paginationSelector: '.prev-next-list, .test-pager',
};

const paginationStrategyOptions = IS_PLAYLIST
  ? createPlaylistPaginationStrategy()
  : paginationStrategyOptionsDefault;

const rules = new RulesGlobal({
  paginationStrategyOptions,
  getPaginationData,
  containerSelectorLast: '.thumb-list',
  thumbsSelector: '.video-thumb',
  titleSelector: '.video-thumb-info__name,.video-thumb-info>a',
  durationSelector: '.thumb-image-container__duration',
  gropeStrategy: 'all-in-all',
  getThumbImgDataStrategy: 'auto',
  getThumbImgDataAttrDelete: '[loading]',
  customThumbDataSelectors: {
    watched: {
      type: 'boolean',
      selector: '[data-role="video-watched',
    },
  },
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
    const video = document.createElement('video');
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.classList.add('thumb-image-container__video');
    video.src = src;
    video.addEventListener(
      'loadeddata',
      () => {
        mount.before(video);
      },
      false,
    );
    return () => exterminateVideo(video);
  }

  onPointerOverAndLeave(
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
  watchElementChildrenCount(rules.container, () => setTimeout(parseThumbs, 1800));
  waitForElementToAppear(document.body, 'button[data-role="show-more-next"]', (el) => {
    const observer = new Observer((target) => {
      (target as HTMLButtonElement).click();
    });
    observer.observe(el);
  });
}

function parseThumbs() {
  const containers = getCommonParents(rules.getThumbs(document.body));
  containers.forEach((c) => {
    rules.dataManager.parseData(c, c);
  });
}

if (IS_VIDEO_PAGE) {
  expandMoreVideoPage();
}
