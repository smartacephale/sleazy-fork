import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { createQualityFilter, Rules } from '../../core';
import { OnHover, querySelectorLast } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Eporner PervertMonkey',
  version: '2.2.1',
  description:
    'Infinite scroll [optional], Filter by Title, Uploader, Duration and HD, Sort by Views and Duration',
  match: ['https://*.eporner.com/*', 'https://*.eporner.*/*'],
  supportURL: 'https://sleazyfork.org/en/scripts/552559-eporner-pervertmonkey/feedback',
};

const containerSelectorLast = 'div:has(div[id^=vf][data-id])';
const paginationSelector = '.numlist2';

const paginationIsInThumbs = !!querySelectorLast(
  document.body,
  containerSelectorLast,
)?.querySelector(paginationSelector);

const intersectionObservableSelector = paginationIsInThumbs ? 'footer' : paginationSelector;

const qualities = {
  quality360: 360,
  quality480: 480,
  quality720: 720,
  quality1080: 1080,
  quality2k: 2,
  quality4k: 4,
};

const { qualityFilter, qualityFilterScheme } = createQualityFilter(qualities);

const rules = new Rules({
  intersectionObservableSelector,
  paginationStrategyOptions: {
    paginationSelector,
    pathnameSelector: /\/(\d+)(?=\/|$)/,
    overwritePaginationLast: (n, _) => (n === 9 ? 9999 : n),
  },
  thumbs: { selector: 'div[id^=vf][data-id]' },
  thumb: {
    selectors: {
      title: 'a[href*=video-]',
      uploader: '[title="Uploader"]',
      duration: '[title="Duration"]',
      views: { selector: '[title="Views"]', type: 'float' },
      quality: { selector: '[title="Quality"]', type: 'number' },
    },
  },
  thumbImg: {
    strategy: 'auto',
    remove: 'auto',
  },
  containerSelectorLast,
  customDataFilterFns: [{ qualityFilter }],
  schemeOptions: [
    'Title Filter',
    'Uploader Filter',
    'Duration Filter',
    ...qualityFilterScheme,
    'Sort By',
    'Badge',
    'Advanced',
  ],
  gropeStrategy: 'all-in-all',
  animatePreview,
});

function animatePreview(doc: HTMLElement) {
  OnHover.create(doc, 'div[id^=vf][data-id]', (e) => {
    const thumb = e.closest('[data-id]');
    (unsafeWindow as any).EP.thumbs.preview.start(thumb);
  });
}
