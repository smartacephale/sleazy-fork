import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core/rules';
import { exterminateVideo, parseHtml } from '../../utils/dom';
import { onPointerOverAndLeave } from '../../utils/events';

export const meta: MonkeyUserScript = {
  name: 'Ebalka PervertMonkey',
  version: '3.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: [
    'https://a.ebalka.love/*',
    'https://b.ebalka.zip/*',
    'https://*ebalka.*.*/*',
    'https://*.ebalk*.*/*',
    'https://*.fuckingbear*.*/*',
  ],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=ebalka.nl',
};

const rules = new RulesGlobal({
  containerSelectorLast: '.content__video',
  paginationStrategyOptions: {
    paginationSelector: '.pagination:not([id *= member])',
  },
  thumbsSelector: '.card_video',
  titleSelector: '.card__title',
  durationSelector: '.card__spot > span:last-child',
  animatePreview,
  schemeOptions: ['Text Filter', 'Badge', 'Duration Filter', 'Advanced'],
});

function animatePreview(container: HTMLElement) {
  function animateThumb(thumb: HTMLElement) {
    const el = thumb.querySelector('.card__thumb_video') as HTMLElement;
    el.classList.toggle('video-on');
    const src = el.querySelector('.card__image')?.getAttribute('data-preview') as string;

    const videoElem =
      parseHtml(`<video style="position: absolute; left: 0px; top: 0px; visibility: visible; margin-top: -1px;"
      autoplay="" loop="" playsinline="true" webkit-playsinline="true" src="${src}"></video>`) as HTMLVideoElement;
    el.appendChild(videoElem);

    return () => {
      el.classList.toggle('video-on');
      exterminateVideo(videoElem);
    };
  }

  onPointerOverAndLeave(
    container,
    (target) => target.tagName === 'IMG',
    (target) => {
      const thumb = target.closest('.card') as HTMLElement;
      const onOverCallback = animateThumb(thumb);
      return { leaveTarget: thumb, onOverCallback };
    },
  );
}
