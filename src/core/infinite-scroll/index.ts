import { fetchHtml, Observer, wait } from '../../utils';
import type { PaginationStrategy } from '../pagination-parsing/pagination-strategies';
import type { RulesGlobal } from '../rules';

type InfiniteScrollerOptions = Pick<InfiniteScroller, 'rules'> & Partial<InfiniteScroller>;
type GeneratorResult = { url: string; offset: number };
export type OffsetGenerator<T = GeneratorResult> = Generator<T> | AsyncGenerator<T>;

export class InfiniteScroller {
  public enabled = true;
  public paginationOffset = 1;
  public parseData?: (document: HTMLElement) => void;
  public rules: RulesGlobal;

  private observer?: Observer;
  private paginationGenerator: OffsetGenerator;

  constructor(options: InfiniteScrollerOptions) {
    this.rules = options.rules;
    this.paginationOffset = this.rules.paginationStrategy.getPaginationOffset();
    Object.assign(this, options);

    if (this.rules.getPaginationData) {
      this.getPaginationData = this.rules.getPaginationData;
    }

    this.paginationGenerator =
      this.rules.customGenerator ||
      InfiniteScroller.generatorForPaginationStrategy(this.rules.paginationStrategy);
    this.setObserver(this.rules.observable);
    this.setAutoScroll();
  }

  public dispose() {
    if (this.observer) this.observer.dispose();
  }

  public setObserver(observable: HTMLElement) {
    if (this.observer) this.observer.dispose();
    this.observer = Observer.observeWhile(
      observable,
      this.generatorConsumer,
      this.rules.store.state.delay as number,
    );
    return this;
  }

  private onScrollCBs: Array<(scroller: InfiniteScroller) => void> = [];

  public onScroll(callback: (scroller: InfiniteScroller) => void, initCall = false) {
    if (initCall) callback(this);
    this.onScrollCBs.push(callback);
    return this;
  }

  private _onScroll() {
    this.onScrollCBs.forEach((cb) => {
      cb(this);
    });
  }

  private setAutoScroll() {
    const autoScrollWrapper = async () => {
      if (this.rules.store.state.autoScroll) {
        await wait(this.rules.store.state.delay as number);
        await this.generatorConsumer();
        await autoScrollWrapper();
      }
    };

    autoScrollWrapper();

    this.rules.store.stateSubject.subscribe((type) => {
      if (type?.autoScroll) {
        autoScrollWrapper();
      }
    });
  }

  generatorConsumer = async () => {
    if (!this.enabled) return false;
    const {
      value: { url, offset },
      done,
    } = await this.paginationGenerator.next();
    if (!done && url) {
      await this.doScroll(url, offset);
    }
    return !done;
  };

  // consume api strategy
  private async getPaginationData(url: string): Promise<HTMLElement> {
    return await fetchHtml(url);
  }

  async doScroll(url: string, offset: number) {
    const nextPageHtml = await this.getPaginationData(url);
    const prevScrollPos = document.documentElement.scrollTop;
    this.paginationOffset = Math.max(this.paginationOffset, offset);
    this.parseData?.(nextPageHtml);
    this._onScroll();
    window.scrollTo(0, prevScrollPos);
    if (this.rules.store.state.writeHistory) {
      history.replaceState({}, '', url);
    }
  }

  static async *generatorForPaginationStrategy(
    pstrategy: PaginationStrategy,
  ): OffsetGenerator {
    const _offset = pstrategy.getPaginationOffset();
    const end = pstrategy.getPaginationLast();
    const urlGenerator = pstrategy.getPaginationUrlGenerator();

    for (let offset = _offset; offset <= end; offset++) {
      const url = await urlGenerator(offset);
      yield { url, offset };
    }
  }

  static create(rules: RulesGlobal) {
    const enabled = rules.store.state.infiniteScrollEnabled as boolean;

    rules.store.state.$paginationLast = rules.paginationStrategy.getPaginationLast();

    const infiniteScroller = new InfiniteScroller({
      enabled,
      parseData: rules.dataManager.parseData,
      rules,
    }).onScroll(({ paginationOffset }) => {
      rules.store.state.$paginationOffset = paginationOffset;
    }, true);

    rules.store.stateSubject.subscribe(() => {
      infiniteScroller.enabled = rules.store.state.infiniteScrollEnabled as boolean;
    });

    return infiniteScroller;
  }
}
