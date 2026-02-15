import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Eroprofile PervertMonkey',
  version: '2.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: ['https://*.eroprofile.com/*'],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=eroprofile.com',
};

document.querySelector('.videoGrid')?.after(document.querySelector('.clB') as HTMLElement);

const rules = new RulesGlobal({
  paginationStrategyOptions: {
    paginationSelector: '.boxNav2',
    searchParamSelector: 'pnum',
  },
  titleSelector: '[title]',
  durationSelector: '.videoDur',
  containerSelector: '.videoGrid',
  thumbsSelector: '.video',
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
