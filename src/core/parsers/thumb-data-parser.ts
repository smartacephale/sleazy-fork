import {
  parseNumberWithLetter,
  querySelectorLast,
  querySelectorText,
  sanitizeStr,
  timeToSeconds,
} from '../../utils';

type Primitive = string | number | boolean;
type PrimitiveString = 'boolean' | 'string' | 'number' | 'float' | 'duration';
type ThumbData = Record<string, Primitive>;
type ThumbDataSelector = {
  name: string;
  selector: string;
  type: PrimitiveString;
};
type ThumbDataSelectorsRaw = Record<
  string,
  string | Pick<ThumbDataSelector, 'selector' | 'type'>
>;

export class ThumbDataParser {
  private autoParseText(thumb: HTMLElement): ThumbData {
    const title = sanitizeStr(thumb.innerText);
    const duration = timeToSeconds(title.match(/\d+m|\d+:\d+/)?.[0] || '');
    return { title, duration };
  }

  public getUrl(thumb: HTMLElement | HTMLAnchorElement) {
    return ((thumb.querySelector('a[href]') || thumb) as HTMLAnchorElement).href;
  }

  private preprocessCustomThumbDataSelectors() {
    if (!this.selectors) return;
    Object.entries(this.selectors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const defaultSelector = this.defaultThumbDataSelectors.find((e) => e.name === key);
        if (!defaultSelector) {
          this.thumbDataSelectors.push({ name: key, selector: value, type: 'string' });
        } else {
          defaultSelector.selector = value;
          this.thumbDataSelectors.push(defaultSelector);
        }
      } else {
        this.thumbDataSelectors.push({ name: key, ...value });
      }
    });
  }

  private thumbDataSelectors: ThumbDataSelector[] = [];
  private readonly defaultThumbDataSelectors: ThumbDataSelector[] = [
    { name: 'title', type: 'string', selector: '[class *= title],[title]' },
    {
      name: 'uploader',
      type: 'string',
      selector: '[class *= uploader], [class *= user], [class *= name]',
    },
    { name: 'duration', type: 'duration', selector: '[class *= duration]' },
  ];

  private getThumbDataWith(
    thumb: HTMLElement,
    { type, selector }: ThumbDataSelector,
  ): Primitive {
    if (type === 'boolean') {
      return !!thumb.querySelector(selector);
    }
    if (type === 'string') {
      return sanitizeStr(querySelectorLast(thumb, selector)?.innerText || '');
    }
    if (type === 'duration') {
      return timeToSeconds(querySelectorText(thumb, selector));
    }
    if (type === 'float') {
      const value = querySelectorText(thumb, selector);
      return parseNumberWithLetter(value);
    }
    return Number.parseInt(querySelectorText(thumb, selector));
  }

  constructor(
    public strategy: 'manual' | 'auto-select' | 'auto-text' = 'manual',
    public selectors: ThumbDataSelectorsRaw = {},
    public callback?: (thumb: HTMLElement, thumbData: ThumbData) => void,
    public stringsMeltInTitle = true,
  ) {
    this.preprocessCustomThumbDataSelectors();
  }

  public static create(
    o: Partial<
      Pick<ThumbDataParser, 'strategy' | 'selectors' | 'callback' | 'stringsMeltInTitle'>
    > = {},
  ) {
    return new ThumbDataParser(o.strategy, o.selectors, o.callback, o.stringsMeltInTitle);
  }

  public getThumbData(thumb: HTMLElement): ThumbData {
    if (this.strategy === 'auto-text') {
      return this.autoParseText(thumb);
    }

    if (this.strategy === 'auto-select') {
      this.thumbDataSelectors = this.defaultThumbDataSelectors;
    }

    const thumbData = Object.fromEntries(
      this.thumbDataSelectors.map((s) => [s.name, this.getThumbDataWith(thumb, s)]),
    );

    if (this.stringsMeltInTitle) {
      Object.entries(thumbData).forEach(([k, v]) => {
        if (typeof v === 'string' && k !== 'title') {
          thumbData.title = `${thumbData.title} ${k}:${v}`;
          delete thumbData[k];
        }
      });
    }

    this.callback?.(thumb, thumbData);

    return thumbData;
  }
}
