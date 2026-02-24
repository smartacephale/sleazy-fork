import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Missav PervertMonkey',
  version: '3.0.1',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
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
  thumb: {
    selectors: {
      title: 'div > div > a.text-secondary',
      duration: 'div > a > span.text-xs',
    }
  },
  thumbImg: { strategy: 'auto' },
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});
