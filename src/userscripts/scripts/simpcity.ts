import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'Simpcity PervertMonkey',
  version: '1.0.3',
  description: 'Infinite scroll [optional], Filter by Title and Uploader, Sort by Views',
  match: [
    'https://simpcity.cr/threads/*',
    'https://simpcity.cr/watched/threads*',
    'https://simpcity.cr/forums/*',
    'https://simpcity.cr/account/bookmarks*',
    'https://simpcity.cr/tags/*',
  ],
  'run-at': 'document-end',
};

const IS_WATCHED_THREADS = /^\/watched\/threads/.test(location.pathname);
const IS_FORUM_PAGE = /^\/forums\//.test(location.pathname);
const IS_BOOKMARKS_PAGE = /^\/account\/bookmarks/.test(location.pathname);
const IS_TAGS_PAGE = /^\/tags\//.test(location.pathname);

type RulesConfig = ConstructorParameters<typeof Rules>[0];

const structItemConfig: RulesConfig = {
  containerSelectorLast: '.structItemContainer-group, .structItemContainer',
  paginationStrategyOptions: {
    paginationSelector: '.block-outer--after .pageNav',
    pathnameSelector: /\/page-(\d+)\/?$/,
  },
  thumbs: {
    selector: '.structItem.structItem--thread',
  },
  thumb: {
    selectors: {
      title: '.structItem-title a',
      uploader: '.structItem-parts .username',
      views: {
        selector: '.structItem-cell--meta dl:nth-of-type(2) dd',
        type: 'float',
      },
      replies: {
        selector: '.structItem-cell--meta dl:nth-of-type(1) dd',
        type: 'float',
      },
    },
  },
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Title Filter', 'Uploader Filter', 'Sort By Views', 'Badge', 'Advanced'],
};

const contentRowConfig: RulesConfig = {
  containerSelector: 'ol.block-body, ol.listPlain',
  paginationStrategyOptions: {
    paginationSelector: '.block-outer--after .pageNav',
    pathnameSelector: /\/page-(\d+)\/?$/,
  },
  thumbs: {
    selector: 'li.block-row',
  },
  thumb: {
    selectors: {
      title: '.contentRow-title a',
      uploader: '.contentRow-minor .username',
    },
    getUrlSelector: '.contentRow-title a',
  },
  schemeOptions: ['Title Filter', 'Uploader Filter', 'Badge', 'Advanced'],
};

const threadConfig: RulesConfig = {
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
};

const rules = new Rules(
  IS_BOOKMARKS_PAGE || IS_TAGS_PAGE
    ? contentRowConfig
    : IS_WATCHED_THREADS || IS_FORUM_PAGE
      ? structItemConfig
      : threadConfig,
);
