import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { GM_addStyle, unsafeWindow } from '$';
import { RulesGlobal } from '../../core';
import { fetchWith, onPointerOverAndLeave, replaceElementTag, Tick } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'Motherless PervertMonkey',
  version: '5.0.0',
  description: 'Infinite scroll [optional], Filter by Title and Duration',
  match: ['https://motherless.com/*'],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=motherless.com',
};

(unsafeWindow as any).__is_premium = true;
const $ = (unsafeWindow as any).$;

const rules = new RulesGlobal({
  containerSelectorLast: '.content-inner',
  thumbsSelector: '.thumb-container, .mobile-thumb',
  uploaderSelector: '.uploader',
  titleSelector: '.title',
  durationSelector: '.size',
  getThumbImgDataStrategy: 'auto',
  paginationStrategyOptions: {
    paginationSelector: '.pagination_link, .ml-pagination',
  },
  animatePreview,
  gropeStrategy: 'all-in-all',
  schemeOptions: ['Text Filter', 'Duration Filter', 'Badge', 'Advanced'],
});

function animatePreview(_: HTMLElement) {
  const ANIMATION_INTERVAL = 500;
  const tick = new Tick(ANIMATION_INTERVAL);
  let currentOverlay: HTMLElement | null = null;

  function onLeave(target: HTMLElement) {
    tick.stop();

    const img = target.querySelector('img.static') as HTMLElement;
    img.classList.remove('animating');

    if (currentOverlay) {
      currentOverlay.style.display = 'none';
    }
  }

  function onOver(target: HTMLElement) {
    $('.video').off();
    const container = target.closest('.desktop-thumb.video') as HTMLElement;
    const img = container.querySelector('img.static') as HTMLImageElement;
    const stripSrc = img.getAttribute('data-strip-src');

    img.classList.add('animating');

    let overlay = img.nextElementSibling as HTMLElement;
    if (!overlay || overlay.tagName !== 'DIV') {
      overlay = document.createElement('div');
      overlay.setAttribute(
        'style',
        'z-index: 8; position: absolute; top: 0; left: 0; pointer-events: none;',
      );
      img.parentNode?.insertBefore(overlay, img.nextSibling);
    }

    currentOverlay = overlay;
    overlay.style.display = 'block';

    let j = 0;
    const containerHeight = container.offsetHeight;

    tick.start(() => {
      const w = img.offsetWidth;
      const h = img.offsetHeight;

      const widthRatio = Math.floor((1000.303 * w) / 100);
      const heightRatio = Math.floor((228.6666 * h) / 100);

      const verticalOffset = (containerHeight - h) / 2;

      Object.assign(overlay.style, {
        width: `${w}px`,
        height: `${containerHeight}px`,
        backgroundImage: `url('${stripSrc}')`,
        backgroundSize: `${widthRatio}px ${heightRatio}px`,
        backgroundPosition: `-${(j++ * w) % widthRatio}px ${verticalOffset}px`,
        backgroundRepeat: 'no-repeat',
      });
    });

    const onOverCallback = () => onLeave(container);
    return { onOverCallback, leaveTarget: container };
  }

  onPointerOverAndLeave(
    document.body,
    (e) => {
      const container = e.closest('.desktop-thumb.video') as HTMLElement;
      if (!container) return false;

      const img = container.querySelector('img.static') as HTMLImageElement;
      if (!img) return false;

      const stripSrc = img.getAttribute('data-strip-src');
      if (!stripSrc || img.classList.contains('animating')) return false;

      return true;
    },
    onOver,
  );
}

//====================================================================================================

function fixURLs() {
  document.querySelectorAll<HTMLElement>('.gallery-container').forEach((g) => {
    const x = (g.innerText as string).match(/([\d|.]+)k? videos/gi)?.[0];
    const hasVideos = parseInt(x as string) > 0;

    const header = hasVideos ? '/GV' : '/GI';

    g.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
      a.href = a.href.replace(/\/G/, () => header);
    });
  });

  document
    .querySelectorAll<HTMLAnchorElement>('a[href^="/term/"]:not([href^="/term/videos/"])')
    .forEach((a) => {
      a.href = a.href.replace(
        /[\w|+]+$/,
        (v) => `videos/${v}?term=${v}&range=0&size=0&sort=date`,
      );
    });

  document
    .querySelectorAll<HTMLAnchorElement>('#media-groups-container a[href^="/g/"]')
    .forEach((a) => {
      a.href = a.href.replace(/\/g\//, '/gv/');
    });
}

//====================================================================================================

function mobileGalleryToDesktop(e: HTMLElement) {
  e.querySelector('.clear-left')?.remove();
  const container = e.firstElementChild as HTMLElement;
  container.appendChild(container.nextElementSibling as HTMLElement);
  e.className = 'thumb-container gallery-container';
  container.className = 'desktop-thumb image medium';
  (container.firstElementChild?.nextElementSibling as HTMLElement).className =
    'gallery-captions';
  replaceElementTag(container.firstElementChild as HTMLElement, 'a');
  return e;
}

async function desktopAddMobGalleries() {
  const galleries = document.querySelector('.media-related-galleries');
  if (!galleries) return;

  const galleriesContainer = galleries.querySelector('.content-inner') as HTMLElement;
  const galleriesCount = galleries.querySelectorAll('.gallery-container').length;
  const mobDom = await fetchWith(window.location.href, { type: 'html', mobile: true });
  const mobGalleries = (mobDom as HTMLElement).querySelectorAll<HTMLElement>(
    '.ml-gallery-thumb',
  );

  for (const [i, x] of mobGalleries.entries()) {
    if (i > galleriesCount - 1) {
      galleriesContainer.append(mobileGalleryToDesktop(x));
    }
  }
}

//====================================================================================================

const overwrite1 = (x: string) => `@media only screen and (max-width: 1280px) {
  #categories-page.inner ${x} }`;

rules.dataManager.dataFilter.applyCSSFilters(overwrite1);

GM_addStyle(`
.img-container, .desktop-thumb { min-height: 150px; max-height: 150px; }

.group-minibio, .gallery-container { display: block !important; }

.ml-masonry-images.masonry-columns-4 .content-inner { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.ml-masonry-images.masonry-columns-6 .content-inner { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); }
.ml-masonry-images.masonry-columns-8 .content-inner { display: grid; grid-template-columns: repeat(8, minmax(0, 1fr)); }
`);

//====================================================================================================

function applySearchFilters() {
  let pathname = window.location.pathname;

  const wordsToFilter =
    (rules.store.state.filterExcludeWords as string)
      .replace(/f:/g, '')
      .match(/(?<!user:)\b\w+\b(?!\s*:)/g) || [];

  wordsToFilter
    .filter((w) => !pathname.includes(w))
    .forEach((w) => {
      pathname += `+-${w.trim()}`;
    });

  if (wordsToFilter.some((w) => !window.location.href.includes(w))) {
    window.location.href = pathname;
  }
}

//====================================================================================================

desktopAddMobGalleries().then(() => fixURLs());

const IS_SEARCH = /^\/term\//.test(location.pathname);
if (IS_SEARCH) {
  applySearchFilters();
}
