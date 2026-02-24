import { removeClassesAndDataAttributes } from '../../utils';

export class ThumbImgParser {
  public selector?: string | string[] | ((img: HTMLImageElement) => string);
  public remove?: 'auto' | string;
  public strategy: 'default' | 'auto' = 'default';

  public static create(
    options: Partial<
      Pick<ThumbImgParser, 'selector' | 'remove' | 'strategy' | 'getImgData'>
    > = {},
  ) {
    return Object.assign(new ThumbImgParser(), options);
  }

  private removeAttrs(img: HTMLImageElement) {
    if (!this.remove) return;
    if (this.remove === 'auto') {
      removeClassesAndDataAttributes(img, 'lazy');
    } else {
      if (this.remove.startsWith('.')) {
        img.classList.remove(this.remove.slice(1));
      } else {
        img.removeAttribute(this.remove);
      }
    }
  }

  private getImgSrc(img: HTMLImageElement) {
    const possibleAttrs = (this.selector as string)
      ? [this.selector as string].flat()
      : ['data-src', 'src'];

    for (const attr of possibleAttrs) {
      const imgSrc = img.getAttribute(attr);
      if (imgSrc) {
        return imgSrc;
      }
    }

    return '';
  }

  public getImgData(thumb: HTMLElement) {
    if (this.strategy === 'default' && !this.selector) return {};

    const img = thumb.querySelector<HTMLImageElement>('img');
    if (!img) return {};

    const imgSrc =
      typeof this.selector === 'function' ? this.selector(img) : this.getImgSrc(img);

    this.removeAttrs(img);

    if (img.src.includes('data:image')) {
      img.src = '';
    }

    if (img.complete && img.naturalWidth > 0) {
      return {};
    }

    return { img, imgSrc };
  }
}
