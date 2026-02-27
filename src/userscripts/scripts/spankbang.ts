import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'SpankBang.com PervertMonkey',
  version: '4.0.4',
  description: 'Infinite scroll [optional]. Filter by Title and Duration',
  match: ['https://*.spankbang.com/*', 'https://*.spankbang.*/*'],
};

const rules = new Rules({
  containerSelector: '.main-container .js-media-list, .main_content_container .video-list',
  paginationStrategyOptions: {
    paginationSelector: '.paginate-bar, .pagination',
  },
  thumbs: { selector: '.video-item:not(.clear-fix), .js-video-item' },
  thumb: {
    selectors: {
      title: '[title]',
      tags: { selector: '[data-testid="title"]', type: 'string' },
      duration: '[data-testid="video-item-length"]',
    }
  },
  thumbImg: { strategy: 'auto' },
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});
