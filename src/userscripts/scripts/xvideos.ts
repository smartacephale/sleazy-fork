import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { RulesGlobal } from '../../core';
import { exterminateVideo, onPointerOverAndLeave, parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'XVideos Improved',
  version: '4.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: 'https://*.xvideos.com/*',
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=xvideos.com',
};

const xv = (unsafeWindow as any).xv;

const rules = new RulesGlobal({
  paginationStrategyOptions: {
    paginationSelector: '#main .pagination:last-child',
    searchParamSelector: 'p',
  },
  containerSelector: '#content > div',
  thumbsSelector: 'div.thumb-block[id^=video_]:not(.thumb-ad)',
  titleSelector: '[class*=title]',
  uploaderSelector: '[class*=name]',
  durationSelector: '[class*=duration]',
  gropeStrategy: 'all-in-one',
  customDataSelectorFns: ['filterInclude', 'filterExclude'],
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
  animatePreview,
  getThumbDataCallback(thumb) {
    setTimeout(() => {
      const id = parseInt(thumb.getAttribute('data-id') as string);
      xv.thumbs.prepareVideo(id);
    }, 200);
  },
});

function animatePreview(container: HTMLElement) {
  function createPreviewElement(src: string, mount: HTMLElement) {
    const elem = parseHtml(`
    <div class="videopv" style="display: none;">
        <video autoplay="autoplay" playsinline="playsinline" muted="muted"></video>
    </div>`);
    mount.after(elem);

    const video = elem.querySelector('video') as HTMLVideoElement;
    video.src = src;
    video.addEventListener(
      'loadeddata',
      () => {
        mount.style.opacity = '0';
        elem.style.display = 'block';
        elem.style.background = '#000';
      },
      false,
    );

    return () => {
      exterminateVideo(video);
      elem.remove();
      mount.style.opacity = '1';
    };
  }

  function getVideoURL(src: string) {
    return src
      .replace(/thumbs169l{1,}/, 'videopreview')
      .replace(/\/\w+\.\d+\.\w+/, '_169.mp4')
      .replace(/(-\d+)_169\.mp4/, (_, b) => `_169${b}.mp4`);
  }

  onPointerOverAndLeave(
    container,
    (target) => target.tagName === 'IMG' && target.id.includes('pic_'),
    (target) => {
      const videoSrc = getVideoURL((target as HTMLImageElement).src);
      const onOverCallback = createPreviewElement(videoSrc, target);
      const leaveTarget = target.closest('.thumb-inside') as HTMLElement;
      return { leaveTarget, onOverCallback };
    },
  );
}
