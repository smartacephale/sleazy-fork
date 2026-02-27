import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';
import { circularShift, OnHover, Tick } from '../../utils';

export const meta: MonkeyUserScript = {
  name: '3Hentai PervertMonkey',
  version: '1.0.4',
  description: 'Infinite scroll [optional], Filter by Title',
  match: 'https://*.3hentai.net/*',
};

const rules = new Rules({
  containerSelectorLast: '.listing-container',
  thumbs: {
    selector: '.doujin-col',
  },
  thumb: {
    selectors: {
      title: '.title',
    },
  },
  thumbImg: {
    strategy: 'auto',
  },
  gropeStrategy: 'all-in-all',
  customDataSelectorFns: ['filterInclude', 'filterExclude'],
  schemeOptions: ['Text Filter', 'Badge', 'Advanced'],
  animatePreview,
});

function animatePreview() {
  const tick = new Tick(500, false);
  const end = 9999;

  function rotate(src: string) {
    return src.replace(/(\d+)(?=t\.jpg$)/, (_, n) => `${circularShift(parseInt(n), end)}`);
  }

  OnHover.create(document.body, '.doujin-col', (e) => {
    const img = e.querySelector('img') as HTMLImageElement;
    const origin = img.src;
    img.src = img.src.replace(/\w+\.\w+$/, '1t.jpg');
    img.onerror = (_) => tick.stop();
    tick.start(
      () => {
        img.src = rotate(img.src);
      },
      () => {
        img.src = origin;
      },
    );

    return () => tick.stop();
  });
}
