import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { Rules } from '../../core';
import { OnHover } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Eporner PervertMonkey',
  version: '2.0.24',
  description:
    'Infinite scroll [optional], Filter by Title, Uploader, Duration and HD, Sort by Views and Duration',
  match: ['https://*.eporner.com/*', 'https://*.eporner.*/*'],
};

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: '.numlist2',
    // pathnameSelector: /\/(\d+)\/?$/,
    // pathnameSelector: /\/(\d+)\/([\w-]+\/)?$/
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
  containerSelectorLast: '#vidresults',
  customDataFilterFns: [
    { quality360: (el, state) => !!state.quality360 && el.quality !== 360 },
    { quality480: (el, state) => !!state.quality480 && el.quality !== 480 },
    { quality720: (el, state) => !!state.quality720 && el.quality !== 720 },
    { quality1080: (el, state) => !!state.quality1080 && el.quality !== 1080 },
    { quality2k: (el, state) => !!state.quality2k && el.quality !== 2 },
    { quality4k: (el, state) => !!state.quality4k && el.quality !== 4 },
  ],
  schemeOptions: [
    'Title Filter',
    'Uploader Filter',
    'Duration Filter',
    {
      title: 'Quality Filter ',
      content: [
        { quality360: false },
        { quality480: false },
        { quality720: false },
        { quality1080: false },
        { quality2k: false },
        { quality4k: false },
      ],
    },
    'Sort By',
    'Badge',
    'Advanced',
  ],
  gropeStrategy: 'all-in-all',
  animatePreview,
});

rules.dataManager.dataFilter.createCssFilters(
  (x) => `#panel-rightXpornstar #vidresults.showall ${x}`,
);

function animatePreview(doc: HTMLElement) {
  OnHover.create(doc, 'div[id^=vf][data-id]', (e) => {
    const thumb = e.closest('[data-id]');
    (unsafeWindow as any).EP.thumbs.preview.start(thumb);
  });
}
