import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { Rules } from '../../core';
import { exterminateVideo, OnHover, parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'XVideos Improved',
  version: '4.0.5',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: 'https://*.xvideos.com/*',
};

const xv = (unsafeWindow as any).xv;

const rules = new Rules({
  paginationStrategyOptions: {
    paginationSelector: '#main .pagination:last-child',
    searchParamSelector: 'p',
  },
  containerSelector: '*:has(>div.thumb-block[id^=video_]:not(.thumb-ad))',
  thumbs: { selector: 'div.thumb-block[id^=video_]:not(.thumb-ad)' },
  thumb: {
    selectors: {
      title: '[class*=title]',
      uploader: '[class*=name]',
      duration: '[class*=duration]',
    },
    callback: (thumb) => {
      setTimeout(() => {
        const id = parseInt(thumb.getAttribute('data-id') as string);
        xv.thumbs.prepareVideo(id);
      }, 200);
    },
  },
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
  animatePreview,
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
    return src.replace(/\w+\.\w+$/, () => 'preview.mp4');
  }

  OnHover.create(container, 'div.thumb-block[id^=video_]:not(.thumb-ad)', (target) => {
    const img = target.querySelector('img') as HTMLImageElement;
    const videoSrc = getVideoURL(img.src);
    return createPreviewElement(videoSrc, img);
  });
}
