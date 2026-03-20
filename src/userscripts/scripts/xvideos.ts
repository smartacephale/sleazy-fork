import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { unsafeWindow } from '$';
import { Rules } from '../../core';
import { exterminateVideo, OnHover, parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'XVideos PervertMonkey',
  version: '4.0.18',
  description:
    'Infinite scroll [optional], Filter by Title, Uploader and Duration. Sort by Duration and Views.',
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
      views: { selector: '.metadata a ~ span', type: 'float' },
      quality: { selector: '.video-hd-mark', type: 'string' },
    },
    callback: (thumb) => {
      setTimeout(() => {
        const id = parseInt(thumb.getAttribute('data-id') as string);
        xv.thumbs.prepareVideo(id);
      }, 200);
    },
  },
  customDataFilterFns: [
    { qualityLow: (e, state) => !!state.qualityLow && e.quality !== '' },
    { quality360: (e, state) => !!state.quality360 && e.quality !== '360p' },
    { quality720: (e, state) => !!state.quality720 && e.quality !== '720p' },
    { quality1080: (e, state) => !!state.quality1080 && e.quality !== '1080p' },
    { quality1440: (e, state) => !!state.quality1440 && e.quality !== '1440p' },
    { quality4k: (e, state) => !!state.quality4k && e.quality !== '4k' },
  ],
  schemeOptions: [
    'Title Filter',
    'Uploader Filter',
    'Duration Filter',
    {
      title: 'Quality Filter',
      content: [
        { qualityLow: false, label: 'Low' },
        { quality360: false, label: '360p' },
        { quality720: false, label: '720p' },
        { quality1080: false, label: '1080p' },
        { quality1440: false, label: '1440p' },
        { quality4k: false, label: '4k' },
      ],
    },
    'Sort By',
    'Badge',
    'Advanced',
  ],
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
