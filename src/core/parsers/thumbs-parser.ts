export class ThumbsParser {
  public selector = '.thumb';
  public strategy: 'default' | 'auto' = 'default';
  public transform?: (thumb: HTMLElement) => void;

  public static create(
    options: Partial<Pick<ThumbsParser, 'selector' | 'strategy' | 'transform'>> = {},
  ) {
    return Object.assign(new ThumbsParser(), options);
  }

  public getThumbs(container: HTMLElement): HTMLElement[] {
    if (!container) return [];

    if (this.strategy === 'auto') {
      if (typeof this.selector !== 'string') return [];
      return [...(container?.children || [])] as HTMLElement[];
    }

    const thumbs = Array.from(container.querySelectorAll<HTMLElement>(this.selector));

    if (typeof this.transform === 'function') {
      thumbs.forEach(this.transform);
    }

    return thumbs;
  }
}
