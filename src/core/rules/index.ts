import { JabronioGUI, JabronioStore, type JabroniTypes, setupScheme } from 'jabroni-outfit';
import {
  getCommonParents,
  querySelectorLast,
  querySelectorText,
  removeClassesAndDataAttributes,
  sanitizeStr,
  timeToSeconds,
  waitForElementToDisappear,
} from '../../utils';
import { DataManager } from '../data-control';
import type { DataSelectorFn } from '../data-control/data-filter';
import { InfiniteScroller, type OffsetGenerator } from '../infinite-scroll/';
import { DefaultScheme, type SchemeOptions, StoreStateDefault } from '../jabroni-config';
import { getPaginationStrategy } from '../pagination-parsing';
import type { PaginationStrategy } from '../pagination-parsing/pagination-strategies';

type ThumbData = {
  title: string;
  duration?: number;
} & { [x: string]: string | boolean | number };

type _CustomThumbDataSelector = {
  selector: string;
  type: 'boolean' | 'string' | 'number';
};

type CustomThumbDataSelector = {
  [x: string]: _CustomThumbDataSelector;
};

export class RulesGlobal {
  public delay?: number;

  public customGenerator?: OffsetGenerator;

  public getThumbUrl(thumb: HTMLElement | HTMLAnchorElement) {
    return ((thumb.querySelector('a[href]') || thumb) as HTMLAnchorElement).href;
  }

  public titleSelector: undefined | string;
  public uploaderSelector: undefined | string;
  public durationSelector: undefined | string;

  public customThumbDataSelectors: undefined | CustomThumbDataSelector;
  public getThumbDataStrategy: 'default' | 'auto-select' | 'auto-text' = 'default';

  public getThumbDataCallback?: (thumb: HTMLElement, thumbData: ThumbData) => void;

  public getThumbData(thumb: HTMLElement): ThumbData {
    let { titleSelector, uploaderSelector, durationSelector } = this;
    const thumbData: ThumbData = { title: '' };

    if (this.getThumbDataStrategy === 'auto-text') {
      const text = sanitizeStr(thumb.innerText);
      thumbData.title = text;
      thumbData.duration = timeToSeconds(text.match(/\d+m|\d+:\d+/)?.[0] || '');
      return thumbData;
    }

    if (this.getThumbDataStrategy === 'auto-select') {
      titleSelector = '[class *= title],[title]';
      durationSelector = '[class *= duration]';
      uploaderSelector = '[class *= uploader], [class *= user], [class *= name]';
    }

    if (this.getThumbDataStrategy === 'auto-select') {
      const selected = querySelectorLast(thumb, titleSelector as string);
      if (selected) {
        thumbData.title = sanitizeStr(selected.innerText as string);
      } else {
        thumbData.title = sanitizeStr(thumb.innerText);
      }
    } else {
      thumbData.title = querySelectorText(thumb, titleSelector);
    }

    if (uploaderSelector) {
      const uploader = querySelectorText(thumb, uploaderSelector);
      thumbData.title = `${thumbData.title} user:${uploader}`;
    }

    if (durationSelector) {
      const duration = timeToSeconds(querySelectorText(thumb, durationSelector));
      thumbData.duration = duration;
    }

    this.getThumbDataCallback?.(thumb, thumbData);

    function getCustomThumbData(
      selector: _CustomThumbDataSelector['selector'],
      type: _CustomThumbDataSelector['type'],
    ): string | number | boolean {
      if (type === 'boolean') {
        return !!thumb.querySelector(selector);
      }
      if (type === 'string') {
        return querySelectorText(thumb, selector);
      }
      return Number.parseInt(querySelectorText(thumb, selector));
    }

    if (this.customThumbDataSelectors) {
      Object.entries(this.customThumbDataSelectors).forEach(([name, x]) => {
        const data = getCustomThumbData(x.selector, x.type);
        Object.assign(thumbData, { [name]: data });
      });
    }

    return thumbData;
  }

  public getThumbImgDataAttrSelector?:
    | string
    | string[]
    | ((img: HTMLImageElement) => string);
  public getThumbImgDataAttrDelete?: 'auto' | string;
  public getThumbImgDataStrategy: 'default' | 'auto' = 'default';

  public getThumbImgData(thumb: HTMLElement) {
    const result: { img?: HTMLImageElement; imgSrc?: string } = {};

    if (this.getThumbImgDataStrategy === 'auto') {
      const img = thumb.querySelector<HTMLImageElement>('img');
      if (!img) return {};

      result.img = img;

      if (typeof this.getThumbImgDataAttrSelector === 'function') {
        result.imgSrc = this.getThumbImgDataAttrSelector(img);
      } else {
        const possibleAttrs = this.getThumbImgDataAttrSelector
          ? [this.getThumbImgDataAttrSelector].flat()
          : ['data-src', 'src'];

        for (const attr of possibleAttrs) {
          const imgSrc = img.getAttribute(attr);
          if (imgSrc) {
            result.imgSrc = imgSrc;
            img.removeAttribute(attr);
            break;
          }
        }
      }

      if (this.getThumbImgDataAttrDelete) {
        if (this.getThumbImgDataAttrDelete === 'auto') {
          removeClassesAndDataAttributes(img, 'lazy');
        } else {
          if (this.getThumbImgDataAttrDelete.startsWith('.')) {
            img.classList.remove(this.getThumbImgDataAttrDelete.slice(1));
          } else {
            img.removeAttribute(this.getThumbImgDataAttrDelete);
          }
        }

        if (img.src.includes('data:image')) {
          result.img.src = '';
        }

        if (img.complete && img.naturalWidth > 0) {
          return {};
        }
      }
    }

    return result;
  }

  public containerSelector: string | (() => HTMLElement) = '.container';
  public containerSelectorLast?: string;

  public intersectionObservableSelector?: string;

  public get intersectionObservable() {
    return (
      this.intersectionObservableSelector &&
      document.querySelector(this.intersectionObservableSelector)
    );
  }

  public get observable(): HTMLElement {
    return (this.intersectionObservable ||
      this.paginationStrategy.getPaginationElement()) as HTMLElement;
  }

  get container() {
    if (typeof this.containerSelectorLast === 'string') {
      return querySelectorLast(document, this.containerSelectorLast) as HTMLElement;
    }
    if (typeof this.containerSelector === 'string') {
      return document.querySelector<HTMLElement>(this.containerSelector) as HTMLElement;
    }
    return this.containerSelector();
  }

  public thumbsSelector = '.thumb';
  public getThumbsStrategy: 'default' | 'auto' = 'default';
  public getThumbsTransform?: (thumb: HTMLElement) => void;

  public getThumbs(html: HTMLElement): HTMLElement[] {
    if (!html) return [];
    let thumbs: HTMLElement[];

    if (this.getThumbsStrategy === 'auto') {
      if (typeof this.containerSelector !== 'string') return [];
      const container = html.querySelector(this.containerSelector);
      thumbs = [...(container?.children || [])] as HTMLElement[];
    }

    thumbs = Array.from(html.querySelectorAll<HTMLElement>(this.thumbsSelector));

    if (typeof this.getThumbsTransform === 'function') {
      thumbs.forEach(this.getThumbsTransform);
    }

    return thumbs;
  }

  public paginationStrategyOptions: Partial<PaginationStrategy> = {};
  public paginationStrategy: PaginationStrategy;

  public customDataSelectorFns: (Record<string, DataSelectorFn<any>> | string)[] = [
    'filterInclude',
    'filterExclude',
    'filterDuration',
  ];

  public animatePreview?: (doc: HTMLElement) => void;

  public storeOptions?: JabroniTypes.StoreStateOptions;

  private createStore() {
    const config = { ...StoreStateDefault, ...this.storeOptions };
    this.store = new JabronioStore(config);
    return this.store;
  }

  public schemeOptions: SchemeOptions = [];

  private createGui() {
    const scheme = setupScheme(
      this.schemeOptions as Parameters<typeof setupScheme>[0],
      DefaultScheme,
    );
    this.gui = new JabronioGUI(scheme, this.store, 'PervertMonkey');
    return this.gui;
  }

  public store: JabronioStore;
  public gui: JabronioGUI;
  public dataManager: DataManager;

  public infiniteScroller?: InfiniteScroller;
  public getPaginationData?: InfiniteScroller['getPaginationData'];

  private resetInfiniteScroller() {
    this.infiniteScroller?.dispose();
    if (!this.paginationStrategy.hasPagination) return;
    this.infiniteScroller = InfiniteScroller.create(this);
  }

  public gropeStrategy: 'all-in-one' | 'all-in-all' = 'all-in-one';

  public gropeInit() {
    if (!this.gropeStrategy) return;
    if (this.gropeStrategy === 'all-in-one') {
      this.dataManager?.parseData(this.container, this.container);
    }
    if (this.gropeStrategy === 'all-in-all') {
      getCommonParents(this.getThumbs(document.body)).forEach((c) => {
        this.dataManager.parseData(c, c, true);
      });
    }
  }

  public get isEmbedded() {
    return window.self !== window.top;
  }

  private setupStoreListeners() {
    const eventsMap = {
      'sort by duration': {
        action: (direction: boolean) => this.dataManager.sortBy('duration', direction),
      },
    };

    let lastEvent: undefined | string;
    let direction = true;

    this.store.eventSubject.subscribe((event) => {
      if (event === lastEvent) {
        direction = !direction;
      } else {
        lastEvent = event;
        direction = true;
      }

      if (event in eventsMap) {
        const ev = eventsMap[event as keyof typeof eventsMap];
        ev?.action(direction);
      }
    });

    this.store.stateSubject.subscribe((a) => {
      this.dataManager.applyFilters(a as { [key: string]: boolean });
    });
  }

  public dataManagerOptions: Partial<DataManager> = {};

  private setupDataManager() {
    this.dataManager = new DataManager(this);
    if (this.dataManagerOptions) {
      Object.assign(this.dataManager, this.dataManagerOptions);
    }

    return this.dataManager;
  }

  private mutationObservers: MutationObserver[] = [];

  public resetOnPaginationOrContainerDeath = true;

  private resetOn() {
    if (!this.resetOnPaginationOrContainerDeath) return;

    const observables = [
      this.container,
      this.intersectionObservable || this.paginationStrategy.getPaginationElement(),
    ].filter(Boolean);

    if (observables.length === 0) return;

    observables.forEach((o) => {
      const observer = waitForElementToDisappear(o as HTMLElement, () => {
        this.reset();
      });
      this.mutationObservers.push(observer);
    });
  }

  public onResetCallback?: () => void;

  private reset() {
    // console.log('\nRESET\n');

    this.mutationObservers.forEach((o) => {
      o.disconnect();
    });
    this.mutationObservers = [];

    this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);

    this.setupDataManager();
    this.setupStoreListeners();

    this.resetInfiniteScroller();

    this.container && this.animatePreview?.(this.container);

    this.gropeInit();

    this.onResetCallback?.();

    this.resetOn();
  }

  constructor(options: Partial<RulesGlobal>) {
    if (this.isEmbedded) throw Error('Embedded is not supported');

    Object.assign(this, options);

    this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);

    this.store = this.createStore();
    this.gui = this.createGui();

    this.dataManager = this.setupDataManager();

    this.reset();
    // console.log('data', this.dataManager.data.values().toArray());
  }
}
