import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core';

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

const rules = new RulesGlobal({
  paginationStrategyOptions: {
    paginationSelector: 'nav[x-data]',
  },
  containerSelector: '.grid[x-data]',
  thumbsSelector: 'div:has(> .thumbnail.group)',
  getThumbImgDataStrategy: 'auto',
  titleSelector: 'div > div > a.text-secondary',
  durationSelector: 'div > a > span.text-xs',
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});
