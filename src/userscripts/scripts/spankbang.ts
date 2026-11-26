import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { createQualityFilter, Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'SpankBang.com PervertMonkey',
  version: '4.2.1',
  description:
    'Infinite scroll [optional]. Filter by Title and Duration. Sort by Duration and Views',
  match: ['https://*.spankbang.com/*', 'https://*.spankbang.*/*'],
};

const qualities = { qualityLow: '', qualityHD: 'HD', quality4k: '4K' };

const { qualityFilter, qualityFilterScheme } = createQualityFilter(qualities);

const rules = new Rules({
  containerSelector: '.main-container .js-media-list, .main_content_container .video-list',
  paginationStrategyOptions: {
    paginationSelector: '.paginate-bar, .pagination',
  },
  thumbs: { selector: '.video-item:not(.clear-fix), .js-video-item' },
  thumb: {
    selectors: {
      title: '[title]',
      duration: '[data-testid="video-item-length"]',
      // tags: { selector: '[data-testid="title"]', type: 'string' },
      views: { selector: '[data-testid="views"]', type: 'float' },
      quality: { selector: '[data-testid="video-item-resolution"]', type: 'string' },
    },
  },
  thumbImg: { strategy: 'auto' },
  gropeStrategy: 'all-in-all',
  customDataFilterFns: [{ qualityFilter }],
  schemeOptions: [
    'Title Filter',
    'Duration Filter',
    ...qualityFilterScheme,
    'Sort By',
    'Badge',
    'Advanced',
  ],
});
