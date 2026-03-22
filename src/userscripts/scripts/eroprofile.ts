import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Eroprofile PervertMonkey',
  version: '2.0.20',
  description: 'Infinite scroll [optional], Filter by Title and Duration, Sort by Duration',
  match: ['https://*.eroprofile.com/*'],
};

document.querySelector('.videoGrid')?.after(document.querySelector('.clB') as HTMLElement);

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: '.boxNav2',
    searchParamSelector: 'pnum',
  },
  thumbs: { selector: '.video' },
  thumb: {
    selectors: {
      title: '[title]',
      duration: '.videoDur',
    },
  },
  containerSelector: '.videoGrid',
  schemeOptions: [
    'Title Filter',
    'Duration Filter',
    'Sort By Duration',
    'Badge',
    'Advanced',
  ],
});
