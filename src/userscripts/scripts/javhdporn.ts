import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Javhdporn PervertMonkey',
  version: '3.0.1',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: [
    "https://*.javhdporn.net/*",
    "https://*.javhdporn.*/*"
  ],
};

const rules = new RulesGlobal({
  containerSelector: 'div:has(> article)',
  thumbsSelector: 'article.thumb-block',
  titleSelector: 'header.entry-header',
  durationSelector: '.duration',
  paginationStrategyOptions: {
    pathnameSelector: /\/page\/(\d+)\/?$/,
  },
  schemeOptions: ['Text Filter', 'Badge', 'Duration Filter', 'Advanced'],
});
