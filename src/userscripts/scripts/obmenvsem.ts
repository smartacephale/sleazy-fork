import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addElement, GM_addStyle } from '$';
import { Rules } from '../../core';
import { fetchHtml, parseUrl } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Obmensvem PervertMonkey',
  version: '1.0.4',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: ['https://*.obmenvsem.com/*', 'https://*.obmenvsem.*/*'],
  grant: ['GM_addStyle', 'GM_addElement', 'unsafeWindow'],
};

const IS_USER_FILES = location.pathname.startsWith('/user_files');
const IS_VIDEO_PAGE = /info.php\?id=\d+$/.test(location.href);
const SEARCH_PARAM = IS_USER_FILES ? 'start' : 'page';

function setup() {
  const container = document.createElement('div');
  container.classList.add('container');
  container.append(
    ...document.querySelectorAll('.item:has(> a.block[href *= info] > img)'),
  );
  document.querySelector('.c2')?.after(container);

  if (!IS_VIDEO_PAGE) {
    GM_addStyle('a.block[href *= info] > img:first-child { height: 240px; }');
  }

  if (IS_VIDEO_PAGE) {
    const vidh = document.querySelector('a[href*=mp4]') as HTMLAnchorElement;
    vidh?.after(
      GM_addElement('video', {
        src: vidh.href,
        controls: true,
        width: vidh.parentElement?.offsetWidth,
      }),
    );
  }
}

setup();

const rules = new Rules({
  paginationStrategyOptions: {
    getPaginationUrlGenerator() {
      const url = parseUrl(location.href);
      return (offset) => {
        const offsetValue = IS_USER_FILES ? offset * 24 : offset;
        url.searchParams.set(SEARCH_PARAM, offsetValue.toString());
        return url.href;
      };
    },
    overwritePaginationLast: () => 9999,
    searchParamSelector: 'page',
    paginationSelector: '.item.pages, .pagination',
  },
  containerSelectorLast: '.container',
  thumbs: { selector: '.item:has(> a.block[href *= info] > img)' },
  thumb: { strategy: 'auto-text' },
  thumbImg: {
    selector: (img) => {
      const url = (img.closest('a') as HTMLAnchorElement).href;
      fetchHtml(url).then((dom) => {
        img.src = dom.querySelector<HTMLImageElement>('img[src*=attach]')?.src || img.src;
      });
      return img.src;
    },
  },
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});
