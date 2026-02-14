import { Observer } from ".";

export class LazyImgLoader {
  public lazyImgObserver: Observer;
  private attributeName = 'data-lazy-load';

  constructor(shouldDelazify: (target: Element) => boolean) {
    this.lazyImgObserver = new Observer((target: Element) => {
      if (shouldDelazify(target)) {
        this.delazify(target as HTMLImageElement);
      }
    });
  }

  lazify(_target: Element, img?: HTMLImageElement, imgSrc?: string) {
    if (!img || !imgSrc) return;
    img.setAttribute(this.attributeName, imgSrc);
    img.src = '';
    this.lazyImgObserver.observe(img);
  }

  delazify = (target: HTMLImageElement) => {
    this.lazyImgObserver.observer.unobserve(target);
    target.src = target.getAttribute(this.attributeName) as string;
    target.removeAttribute(this.attributeName);
  };
}
