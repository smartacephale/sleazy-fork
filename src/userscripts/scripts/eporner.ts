import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { Rules } from '../../core';
import { OnHover } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Eporner PervertMonkey',
  version: '2.0.5',
  description: 'Infinite scroll [optional], Filter by Title, Duration and HD',
  match: ['https://*.eporner.com/*', 'https://*.eporner.*/*'],
};

const show_video_prev = (unsafeWindow as any).show_video_prev;

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: '.numlist2',
  },
  thumbs: { selector: 'div[id^=vf][data-id]' },
  thumb: {
    selectors: {
      quality: { type: 'number', selector: '[title="Quality"]' },
      title: 'a',
      uploader: '[title="Uploader"]',
      duration: '[title="Duration"]',
    },
  },
  thumbImg: {
    strategy: 'auto',
    remove: 'auto',
  },
  containerSelectorLast: '#vidresults',
  customDataSelectorFns: [
    'filterInclude',
    'filterExclude',
    'filterDuration',
    {
      quality360: (el, state) => !!state.quality360 && el.quality !== 360,
    },
    {
      quality480: (el, state) => !!state.quality480 && el.quality !== 480,
    },
    {
      quality720: (el, state) => !!state.quality720 && el.quality !== 720,
    },
    {
      quality1080: (el, state) => !!state.quality1080 && el.quality !== 1080,
    },
    {
      quality4k: (el, state) => !!state.quality4k && el.quality !== 4,
    },
  ],
  schemeOptions: [
    'Text Filter',
    'Badge',
    'Duration Filter',
    {
      title: 'Quality Filter ',
      content: [
        {
          quality360: false,
        },
        {
          quality480: false,
        },
        {
          quality720: false,
        },
        {
          quality1080: false,
        },
        {
          quality4k: false,
        },
      ],
    },
    'Advanced',
  ],
  animatePreview,
});

function animatePreview(doc: HTMLElement) {
  OnHover.create(doc, 'div[id^=vf][data-id]', (e) => {
    const target = e as HTMLImageElement;
    const thumb = target.closest('[data-id]');
    const id = thumb?.getAttribute('data-id');
    show_video_prev(id);
  });
}
