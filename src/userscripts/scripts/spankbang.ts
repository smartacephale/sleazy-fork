import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'SpankBang.com PervertMonkey',
  version: '4.1.0',
  description:
    'Infinite scroll [optional]. Filter by Title and Duration. Sort by Duration and Views',
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
      duration: '[data-testid="video-item-length"]',
      // tags: { selector: '[data-testid="title"]', type: 'string' },
      views: { selector: '[data-testid="views"]', type: 'float' },
      quality: { selector: '[data-testid="video-item-resolution"]', type: 'string' },
    },
  },
  thumbImg: { strategy: 'auto' },
  gropeStrategy: 'all-in-all',
  customDataFilterFns: [
    {
      qualityFilter: {
        handle(el, state) {
          const hasAnyQualitySelected =
            state.qualityLow ||
            state.qualityHD ||
            state.quality4k;

          if (!hasAnyQualitySelected) return false;

          return !(
            (state.qualityLow && el.quality === '') ||
            (state.qualityHD && el.quality === 'HD') ||
            (state.quality4k && el.quality === '4K')
          );
        },
        deps: ['qualityLow', 'qualityHD', 'quality4k'],
      },
    },
  ],
  schemeOptions: [
    'Title Filter',
    'Duration Filter',
    {
      title: 'Quality Filter',
      content: [
        { qualityLow: false, label: 'Low' },
        { qualityHD: false, label: 'HD' },
        { quality4k: false, label: '4K' },
      ],
    },
    'Sort By',
    'Badge',
    'Advanced',
  ],
});
