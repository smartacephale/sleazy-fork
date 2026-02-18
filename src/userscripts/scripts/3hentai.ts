import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core';

export const meta: MonkeyUserScript = {
  name: '3Hentai PervertMonkey',
  version: '1.0.0',
  description: 'Infinite scroll [optional], Filter by Title',
  match: 'https://*.3hentai.net/*',
};

const rules = new RulesGlobal({
  containerSelectorLast: '.listing-container',
  thumbsSelector: '.doujin-col',
  titleSelector: '.title',
  getThumbImgDataStrategy: 'auto',
  gropeStrategy: 'all-in-all',
  customDataSelectorFns: ['filterInclude', 'filterExclude'],
  schemeOptions: ['Text Filter', 'Badge', 'Advanced'],
});
