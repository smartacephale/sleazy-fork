import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Eroprofile PervertMonkey',
  version: '2.0.21',
  description: 'Infinite scroll [optional], Filter by Title and Duration, Sort by Duration',
  match: ['https://*.eroprofile.com/*'],
};

document.querySelector('.videoGrid')?.after(document.querySelector('.clB') as HTMLElement);

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: '.page-nav',
    searchParamSelector: 'pnum',
  },
  thumbs: { selector: '.grid-tile-video' },
  thumb: {
    selectors: {
      title: '.title',
      duration: '.duration',
    },
  },
  containerSelector: 'div:has(>.grid-tile-video)',
  schemeOptions: [
    'Title Filter',
    'Duration Filter',
    'Sort By Duration',
    'Badge',
    'Advanced',
  ],
});
