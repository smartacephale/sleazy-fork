import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core/rules';

export const meta: MonkeyUserScript = {
  name: 'Missav PervertMonkey',
  version: '3.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: [
    'https://*.missav.*/*',
    'https://*.missav123.com/*',
    'https://*.missav.ws/*',
    'https://*.missav.to/*',
    'https://*.missav.live/*',
  ],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=missav123.com',
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
