import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core/rules';

export const meta: MonkeyUserScript = {
  name: 'PornHub PervertMonkey',
  version: '4.0.0',
  description:
    'Infinite scroll [optional]. Filter by Title and Duration',
  match: ['https://*.pornhub.com/*'],
  exclude: 'https://*.pornhub.com/embed/*',
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=pornhub.com',
};

const rules = new RulesGlobal({
  paginationStrategyOptions: {
    paginationSelector: '.paginationGated',
    overwritePaginationLast: (n: number) => (n === 9 ? 999 : n),
  },
  containerSelector: () =>
    [...document.querySelectorAll<HTMLElement>('ul:has(> li[data-video-vkey])')]
      .filter((e) => e.children.length > 0 && e.checkVisibility())
      .pop() as HTMLElement,

  dataManagerOptions: {
    parseDataParentHomogenity: { id: true, className: true },
  },
  thumbsSelector: 'li[data-video-vkey]',
  getThumbImgDataStrategy: 'auto',
  getThumbImgDataAttrSelector: ['data-mediumthumb', 'data-image'],
  uploaderSelector: '.usernameWrap',
  titleSelector: 'span.title',
  durationSelector: '.duration',
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});

function bypassAgeVerification() {
  document
    .querySelectorAll<HTMLButtonElement>('[data-label="over18_enter"]')
    .forEach((b) => {
      b.click();
    });

  setTimeout(() => {
    cookieStore.set({
      name: 'accessAgeDisclaimerPH',
      value: '2',
      expires: Date.now() + 90 * 24 * 60 * 60 * 1000,
    });
  }, 1000);
}

bypassAgeVerification();
