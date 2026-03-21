import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Socialmediagirls PervertMonkey',
  version: '1.0.3',
  description: 'Infinite scroll [optional], Filter by Title',
  match: 'https://forums.socialmediagirls.com/threads/*',
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
  },
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Title Filter', 'Badge', 'Advanced'],
});
