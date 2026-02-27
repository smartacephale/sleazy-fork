import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Eroprofile PervertMonkey',
  version: '2.0.3',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
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
  customDataSelectorFns: ['filterInclude', 'filterExclude', 'filterDuration'],
  schemeOptions: [
    'Text Filter',
    'Duration Filter',
    {
      title: 'Sort By ',
      content: [
        {
          'sort by duration': () => {},
        },
      ],
    },
    'Badge',
    'Advanced',
  ],
});
