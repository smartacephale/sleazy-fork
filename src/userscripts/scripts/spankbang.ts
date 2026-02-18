import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core';
import { exterminateVideo, OnHover, parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'SpankBang.com PervertMonkey',
  version: '4.0.1',
  description: 'Infinite scroll [optional]. Filter by Title and Duration',
  match: ['https://*.spankbang.com/*', 'https://*.spankbang.*/*'],
};

const rules = new RulesGlobal({
  containerSelector: '.main-container .js-media-list, .main_content_container .video-list',
  paginationStrategyOptions: {
    paginationSelector: '.paginate-bar, .pagination',
  },
  thumbsSelector: '.video-item:not(.clear-fix), .js-video-item',
  getThumbImgDataStrategy: 'auto',
  titleSelector: '[title]',
  durationSelector: '[data-testid="video-item-length"]',
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
  animatePreview,
});

function animatePreview(container: HTMLElement) {
  function createPreviewElement(src: string) {
    return parseHtml(`
    <div class="video-js vjs-controls-disabled vjs-workinghover vjs-v7 vjs-playing vjs-has-started mp4t_video-dimensions vjs-user-inactive"
        id="mp4t_video" tabindex="-1" lang="en" translate="no" role="region" aria-label="Video Player"
        style="opacity: 1;">
        <video id="mp4t_video_html5_api" class="vjs-tech" tabindex="-1" autoplay="autoplay" muted="muted" playsinline="playsinline"
                src="${src}">
        </video>
    </div>`);
  }

  function animateThumb(e: HTMLElement) {
    const src = e.querySelector('[data-preview]')?.getAttribute('data-preview') as string;
    const vid = createPreviewElement(src);
    e.append(vid);
    return () => {
      const v = vid.querySelector('video') as HTMLVideoElement;
      exterminateVideo(v);
      vid.remove();
    };
  }

  OnHover.create(
    container,
    (e) => e.tagName === 'IMG',
    (e) => {
      const target = e as HTMLImageElement;
      const leaveTarget = target.closest('.thumb') as HTMLElement;
      const onOverCallback = animateThumb(leaveTarget);
      return { leaveTarget, onOverCallback };
    },
  );
}
