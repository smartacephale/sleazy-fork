import type { Rules } from '../rules';

export class ThumbsParser {
  public selector = '.thumb';
  public strategy: 'default' | 'auto' = 'default';
  public transform?: (thumb: HTMLElement, document?: Document) => void;
  public rules?: Rules;

  public static create(
    options: Partial<Pick<ThumbsParser, 'selector' | 'strategy' | 'transform'>> = {},
    rules: Rules,
  ) {
    return Object.assign(new ThumbsParser(), options, { rules: rules });
  }

  public getThumbs(container: HTMLElement): HTMLElement[] {
    if (!container) return [];

    if (this.strategy === 'auto') {
      if (typeof this.selector !== 'string') return [];
      return [...(container?.children || [])] as HTMLElement[];
    }

    const thumbs = Array.from(container.querySelectorAll<HTMLElement>(this.selector));

    if (typeof this.transform === 'function') {
      thumbs.forEach((t) => {
        this?.transform?.(t, this.rules?.infiniteScroller?.cachedUrlDocument);
      });
    }

    return thumbs;
  }
}
