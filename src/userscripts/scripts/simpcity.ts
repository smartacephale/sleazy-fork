import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Simpcity PervertMonkey',
  version: '1.0.2',
  description: 'Infinite scroll [optional], Filter by Title',
  match: 'https://simpcity.cr/threads/*',
  'run-at': 'document-end',
};

const rules = new Rules({
  containerSelector: '.js-replyNewMessageContainer',
  paginationStrategyOptions: {
    paginationSelector: '.block-container + * .pageNav',
    pathnameSelector: /\/page-(\d+)\/?$/,
  },
  thumbs: {
    selector: 'article.message',
  },
  thumb: {
    strategy: 'auto-text',
    getUrlSelector: 'a[href*=threads]',
  },
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Title Filter', 'Badge', 'Advanced'],
});
