import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Missav PervertMonkey',
  version: '3.0.19',
  description: 'Infinite scroll [optional], Filter by Title and Duration, Sort by Duration',
  match: [
    'https://*.missav123.com/*',
    'https://*.missav.*/*',
    'https://*.missav.ws/*',
    'https://*.missav.to/*',
    'https://*.missav.live/*',
  ],
};

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: 'nav[x-data]',
  },
  containerSelector: '.grid[x-data]',
  thumbs: { selector: 'div:has(> .thumbnail.group)' },
  thumb: { strategy: 'auto-text' },
  thumbImg: { strategy: 'auto' },
  schemeOptions: [
    'Title Filter',
    'Duration Filter',
    'Sort By Duration',
    'Badge',
    'Advanced',
  ],
});
