import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';
import { exterminateVideo, OnHover, parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'x-x-x.video PervertMonkey',
  version: '1.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration, Sort by Duration',
  match: [
    'https://x-x-x.video/*',
    'https://x-x-x.tube/*',
    'https://*.extreme.adult/*'
  ],
};

const rules = new Rules({
  containerSelector: ".thumbs-videos,.thumb-holder,.thumbs",
  thumbs: { selector: ".item.thumb" },
  thumb: { strategy: "auto-text" },
  thumbImg: { selector: "data-original" },
  schemeOptions: [
    "Title Filter",
    "Duration Filter",
    "Sort By Duration",
    "Badge",
    "Advanced"
  ],
  animatePreview
});

function animatePreview(container: HTMLElement) {
  function createPreviewElement(src: string, mount: HTMLElement) {
    const { width, height } = mount.getBoundingClientRect();

    const video = parseHtml(`
        <video autoplay loop style="position: absolute; left: 0px; top: 0px; width: ${width}px; height: ${height}px;" muted="muted" src="${src}"></video>`) as HTMLVideoElement;

    mount.after(video);

    return () => exterminateVideo(video);
  }

  OnHover.create(container, ".item.thumb", (target) => {
    const img = target.querySelector<HTMLImageElement>("img");
    const dataPreview = img?.getAttribute('data-preview') as string;
    return createPreviewElement(dataPreview, img as HTMLElement);
  });
}