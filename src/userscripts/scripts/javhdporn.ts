import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core/rules';

export const meta: MonkeyUserScript = {
  name: 'Javhdporn PervertMonkey',
  version: '3.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: [
    "https://*.javhdporn.net/*",
    "https://*.javhdporn.*/*"
  ],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=javhdporn.net',
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
