import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';
import { circularShift, OnHover, Tick } from '../../utils';

export const meta: MonkeyUserScript = {
  name: '3Hentai PervertMonkey',
  version: '1.0.3',
  description: 'Infinite scroll [optional], Filter by Title',
  match: 'https://*.3hentai.net/*',
};

const rules = new Rules({
  containerSelectorLast: '.listing-container',
  thumbs: {
    selector: '.doujin-col'
  },
  thumb: {
    selectors: {
      title: '.title',
    }
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
    return src.replace(/(\d+)(?=t\.jpg$)/,
      (_, n) => `${circularShift(parseInt(n), end)}`);
  }

  OnHover.create(
    document.body,
    (e) => e instanceof HTMLImageElement && e.src.endsWith('.jpg'),
    (e) => {
      const t = e as HTMLImageElement;
      const origin = t.src;
      t.src = t.src.replace(/\w+\.\w+$/, '1t.jpg');
      t.onerror = (_) => tick.stop();
      tick.start(
        () => {
          t.src = rotate(t.src);
        },
        () => {
          t.src = origin;
        },
      );
    },
    (_) => tick.stop()
  );
}
