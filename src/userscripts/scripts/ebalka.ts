import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';
import { downloader, exterminateVideo, OnHover, parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Ebalka PervertMonkey',
  version: '3.0.17',
  description:
    'Infinite scroll [optional], Filter by Title and Duration, Sort by Duration, Download button.',
  match: [
    'https://b.ebalka.zip/*',
    'https://a.ebalka.love/*',
    'https://*ebalka.*.*/*',
    'https://*.ebalk*.*/*',
    'https://*.fuckingbear*.*/*',
  ],
};

const rules = new Rules({
  containerSelectorLast: '.content__video',
  paginationStrategyOptions: {
    paginationSelector: '.pagination:not([id *= member])',
  },
  thumbs: {
    selector: '.card_video',
  },
  thumb: {
    selectors: {
      title: '.card__title',
      duration: '.card__spot > span:last-child',
      hd: { selector: '.card__icons > .card__icon', type: 'boolean' },
    },
  },
  animatePreview,
  schemeOptions: [
    'Title Filter',
    'Duration Filter',
    'HD Filter',
    'Sort By Duration',
    'Badge',
    'Advanced',
  ],
});

function animatePreview(container: HTMLElement) {
  function animateThumb(thumb: HTMLElement) {
    const e = thumb.querySelector('.card__thumb_video') as HTMLElement;
    e.classList.toggle('video-on');
    const src = e.querySelector('.card__image')?.getAttribute('data-preview') as string;

    const videoElem =
      parseHtml(`<video style="position: absolute; left: 0px; top: 0px; visibility: visible; margin-top: -1px;"
      autoplay="" loop="" playsinline="true" webkit-playsinline="true" src="${src}"></video>`) as HTMLVideoElement;
    e.appendChild(videoElem);

    return () => {
      e.classList.toggle('video-on');
      exterminateVideo(videoElem);
    };
  }

  OnHover.create(container, '.card_video', (target) => {
    const thumb = target.closest('.card') as HTMLElement;
    return animateThumb(thumb);
  });
}

document.querySelector('.tabs-menu') &&
  downloader({
    append: '.tabs-menu',
    doBefore: () => document.querySelector('video')?.click(),
    buttonHtml:
      '<li class="ml-20"><a class="button button_regular button_list root__link">Download ⤓</a></li>',
  });
