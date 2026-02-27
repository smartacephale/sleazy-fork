import { JabronioGUI, JabronioStore, type JabroniTypes, setupScheme } from 'jabroni-outfit';
import {
  getCommonParents,
  querySelectorLast,
  waitForElementToDisappear,
} from '../../utils';
import { DataManager, type DataSelectorFn } from '../data-handler';
import { InfiniteScroller, type OffsetGenerator } from '../infinite-scroll';
import {
  DefaultScheme,
  JabronioGuiController,
  type SchemeOptions,
  StoreStateDefault,
} from '../jabroni-config';
import {
  getPaginationStrategy,
  type PaginationStrategy,
  ThumbDataParser,
  ThumbImgParser,
  ThumbsParser,
} from '../parsers';

export class Rules {
  public thumb: Parameters<typeof ThumbDataParser.create>[0] = {};
  public thumbDataParser: ThumbDataParser;

  public thumbImg: Parameters<typeof ThumbImgParser.create>[0] = {};
  public thumbImgParser: ThumbImgParser;

  public thumbs: Parameters<typeof ThumbsParser.create>[0] = {};
  public thumbsParser: ThumbsParser;

  public containerSelector: string | (() => HTMLElement) = '.container';
  public containerSelectorLast?: string;

  get container() {
    if (typeof this.containerSelectorLast === 'string') {
      return querySelectorLast(document, this.containerSelectorLast) as HTMLElement;
    }
    if (typeof this.containerSelector === 'string') {
      return document.querySelector<HTMLElement>(this.containerSelector) as HTMLElement;
    }
    return this.containerSelector();
  }

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

  public paginationStrategyOptions: Partial<PaginationStrategy> = {};
  public paginationStrategy: PaginationStrategy;

  public dataManager: DataManager;
  public dataHomogenity: ConstructorParameters<typeof DataManager>[1];
  public customDataSelectorFns: (Record<string, DataSelectorFn<any>> | string)[] = [
    'filterInclude',
    'filterExclude',
    'filterDuration',
  ];

  public animatePreview?: (doc: HTMLElement) => void;

  public storeOptions?: JabroniTypes.StoreStateOptions;
  public schemeOptions: SchemeOptions = [];
  public store: JabronioStore;
  public gui: JabronioGUI;
  public inputController: JabronioGuiController;

  private createStore() {
    const config = { ...StoreStateDefault, ...this.storeOptions };
    this.store = new JabronioStore(config);
    return this.store;
  }

  private createGui() {
    const scheme = setupScheme(
      this.schemeOptions as Parameters<typeof setupScheme>[0],
      DefaultScheme,
    );
    this.gui = new JabronioGUI(scheme, this.store, 'PervertMonkey');
    return this.gui;
  }

  public customGenerator?: OffsetGenerator;
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
      getCommonParents(this.thumbsParser.getThumbs(document.body)).forEach((c) => {
        this.dataManager.parseData(c, c, true);
      });
    }
  }

  public get isEmbedded() {
    return window.self !== window.top;
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
    this.mutationObservers.forEach((o) => {
      o.disconnect();
    });
    this.mutationObservers = [];

    this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);

    this.dataManager = new DataManager(this, this.dataHomogenity);

    this.inputController.dispose();
    this.inputController = new JabronioGuiController(this.store, this.dataManager);

    this.resetInfiniteScroller();

    this.container && this.animatePreview?.(this.container);

    this.gropeInit();

    this.onResetCallback?.();

    this.resetOn();
  }

  constructor(options: Partial<Rules>) {
    if (this.isEmbedded) throw Error('Embedded is not supported');

    Object.assign(this, options);

    this.thumbDataParser = ThumbDataParser.create(this.thumb);
    this.thumbImgParser = ThumbImgParser.create(this.thumbImg);
    this.thumbsParser = ThumbsParser.create(this.thumbs, this.containerSelector as string);

    this.paginationStrategy = getPaginationStrategy(this.paginationStrategyOptions);

    this.store = this.createStore();
    this.gui = this.createGui();

    this.dataManager = new DataManager(this, this.dataHomogenity);
    this.inputController = new JabronioGuiController(this.store, this.dataManager);

    this.reset();
  }
}
