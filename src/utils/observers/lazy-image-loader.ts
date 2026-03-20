import { Observer } from '.';

export class LazyImgLoader<T extends Element = HTMLElement> {
  private lazyImgObserver: Observer;

  constructor(
    shouldDelazify: (target: T) => boolean,
    private attributeName = 'data-lazy-orangutan',
  ) {
    this.lazyImgObserver = new Observer((target: Element) => {
      if (shouldDelazify(target as T)) {
        this.unlazify(target as HTMLImageElement);
      }
    });
  }

  public lazify(img?: HTMLImageElement, imgSrc?: string) {
    if (!img || !imgSrc) return;
    img.setAttribute(this.attributeName, imgSrc);
    img.src = '';
    this.lazyImgObserver.observe(img);
  }

  private unlazify(target: HTMLImageElement) {
    this.lazyImgObserver.unobserve(target);
    target.src = target.getAttribute(this.attributeName) as string;
    target.removeAttribute(this.attributeName);
  }
}
