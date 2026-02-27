import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';

export const meta: MonkeyUserScript = {
  name: 'PornHub PervertMonkey',
  version: '4.0.4',
  description: 'Infinite scroll [optional]. Filter by Title and Duration',
  match: ['https://*.pornhub.com/*'],
  exclude: 'https://*.pornhub.com/embed/*',
};

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: '.paginationGated',
    overwritePaginationLast: (n: number) => (n === 9 ? 9999 : n),
  },
  containerSelector: () =>
    [...document.querySelectorAll<HTMLElement>('ul:has(> li[data-video-vkey])')]
      .filter((e) => e.children.length > 0 && e.checkVisibility())
      .pop() as HTMLElement,

  dataHomogenity: { id: true, className: true },
  thumbs: { selector: 'li[data-video-vkey]' },
  thumb: {
    selectors: {
      title: 'span.title',
      uploader: '.usernameWrap',
      duration: '.duration',
    },
  },
  thumbImg: {
    selector: ['data-mediumthumb', 'data-image'],
  },
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});

function bypassAgeVerification() {
  cookieStore.set({
    name: 'accessAgeDisclaimerPH',
    value: '2',
    expires: Date.now() + 90 * 24 * 60 * 60 * 1000,
  });

  document
    .querySelectorAll<HTMLButtonElement>('[data-label="over18_enter"]')
    .forEach((b) => {
      b.click();
    });
}

bypassAgeVerification();
