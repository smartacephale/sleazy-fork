import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Javhdporn PervertMonkey',
  version: '3.0.2',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: [
    "https://*.javhdporn.net/*",
    "https://*.javhdporn.*/*"
  ],
};

const rules = new Rules({
  containerSelector: 'div:has(> article)',
  thumbs: { selector: 'article.thumb-block' },
  thumb: {
    selectors: {
      title: 'header.entry-header',
      duration: '.duration',
    }
  },
  paginationStrategyOptions: {
    pathnameSelector: /\/page\/(\d+)\/?$/,
  },
  schemeOptions: ['Text Filter', 'Badge', 'Duration Filter', 'Advanced'],
});
