import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { Rules } from '../../core';
import { circularShift, OnHover, Tick } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'xmegadrive PervertMonkey',
  version: '1.0.0',
  description:
    'Infinite scroll [optional]. Filter by Title and Duration. Sort by Duration and Views.',
  match: ['https://*.xmegadrive.com/*'],
  exclude: 'https://*.xmegadrive.com/*mode=async*',
};

const $ = (unsafeWindow as any).$;

const rules = new Rules({
  containerSelector:
    '[id*="playlist"]:has(> .item .title),[id*="videos"]:has(> .item .title),form:has(>.item .title)',
  paginationStrategyOptions: {
    paginationSelector: '.pagination:not([id *= member])',
  },
  thumbs: {
    selector:
      '.list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)',
  },
  thumb: {
    strategy: 'auto-select',
    selectors: {
      private: { type: 'boolean', selector: '[class*=private]' },
      views: { selector: '.views', type: 'float' },
    },
  },
  dataManagerOptions: { removeDuplicates: true },
  thumbImg: {
    selector: 'data-original',
  },
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Title Filter', 'Duration Filter', 'Sort By', 'Badge', 'Advanced'],
  animatePreview,
});

function animatePreview(container: HTMLElement) {
  const tick = new Tick(500);

  function killjquery(n = 10) {
    if (n > 0) {
      n--;
      $('img[data-cnt]').off();
      setTimeout(() => killjquery(n), 250);
    }
  }

  killjquery();

  function rotateImg(src: string, count: number) {
    return src.replace(/(\d)(?=\.jpg$)/, (_, n) => `${circularShift(parseInt(n), count)}`);
  }

  OnHover.create(
    container,
    '.list-videos .item, .playlist .item, .list-playlists > div > .item, .item:has(.title)',
    (e) => {
      const img = e.querySelector('img') as HTMLImageElement;
      const origin = img.src;
      const count = parseInt(img.getAttribute('data-cnt') as string) || 5;
      tick.start(
        () => {
          img.src = rotateImg(img.src, count);
        },
        () => {
          img.src = origin;
        },
      );
      return () => tick.stop();
    },
  );
}
