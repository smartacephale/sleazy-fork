import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Javhdporn PervertMonkey',
  version: '3.0.18',
  description:
    'Infinite scroll [optional], Filter by Title and Duration, Sort By Duration and Views',
  match: ['https://*.javhdporn.net/*', 'https://*.javhdporn.*/*'],
};

const rules = new Rules({
  containerSelector: 'div:has(> article)',
  thumbs: { selector: 'article.thumb-block' },
  thumb: {
    selectors: {
      title: 'header.entry-header',
      duration: '.duration',
      views: { selector: '.views', type: 'float' },
    },
  },
  paginationStrategyOptions: {
    pathnameSelector: /\/page\/(\d+)\/?$/,
  },
  schemeOptions: ['Title Filter', 'Duration Filter', 'Sort By', 'Badge', 'Advanced'],
});
