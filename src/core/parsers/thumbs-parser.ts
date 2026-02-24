export class ThumbsParser {
  public selector = '.thumb';
  public strategy: 'default' | 'auto' = 'default';
  public transform?: (thumb: HTMLElement) => void;

  public static create(options: Partial<Pick<ThumbsParser, 'selector' | 'strategy' | 'transform'>> = {}, containerSelector: string) {
    return Object.assign(new ThumbsParser(containerSelector), options);
  }
  constructor(public containerSelector: string) { }

  public getThumbs(html: HTMLElement): HTMLElement[] {
    if (!html) return [];
    let thumbs: HTMLElement[];

    if (this.strategy === 'auto') {
      if (typeof this.selector !== 'string') return [];
      const container = html.querySelector(this.containerSelector);
      thumbs = [...(container?.children || [])] as HTMLElement[];
    }

    thumbs = Array.from(html.querySelectorAll<HTMLElement>(this.selector));

    if (typeof this.transform === 'function') {
      thumbs.forEach(this.transform);
    }

    return thumbs;
  }
}