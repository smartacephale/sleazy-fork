import { Subject } from 'rxjs';
import { fetchHtml, Observer, wait } from '../../utils';
import type { PaginationStrategy } from '../parsers';
import type { Rules } from '../rules';

type InfiniteScrollerOptions = Pick<InfiniteScroller, 'rules'> & Partial<InfiniteScroller>;
type GeneratorResult = { url: string; offset: number };
export type OffsetGenerator<T = GeneratorResult> = Generator<T> | AsyncGenerator<T>;

type IScrollerSubject = { type: 'scroll'; scroller: InfiniteScroller; page: HTMLElement };

export class InfiniteScroller {
  public enabled = true;
  public paginationOffset = 1;
  public rules: Rules;

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

  public subject = new Subject<IScrollerSubject>();

  private setAutoScroll() {
    const autoScrollWrapper = async () => {
      if (this.rules.store.state.autoScroll) {
        await wait(this.rules.store.state.delay as number);
        const res = await this.generatorConsumer();
        if (!res) return;
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

    const { value, done } = await this.paginationGenerator.next();
    if (done) return false;
    
    const { url, offset } = value;
    await this.doScroll(url, offset);
    return true;
  };

  private async getPaginationData(url: string): Promise<HTMLElement> {
    return await fetchHtml(url);
  }

  async doScroll(url: string, offset: number) {
    const page = await this.getPaginationData(url);
    const prevScrollPos = document.documentElement.scrollTop;
    this.paginationOffset = Math.max(this.paginationOffset, offset);
    this.subject.next({ type: 'scroll', scroller: this, page });
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

  static create(rules: Rules) {
    const enabled = rules.store.state.infiniteScrollEnabled as boolean;

    rules.store.state.$paginationLast = rules.paginationStrategy.getPaginationLast();

    const infiniteScroller = new InfiniteScroller({ enabled, rules });

    rules.store.state.$paginationOffset = infiniteScroller.paginationOffset;

    infiniteScroller.subject.subscribe((x) => {
      if (x.type === 'scroll') {
        rules.store.state.$paginationOffset = x.scroller.paginationOffset;
        rules.dataManager.parseData(x.page);
      }
    });

    rules.store.stateSubject.subscribe(() => {
      infiniteScroller.enabled = rules.store.state.infiniteScrollEnabled as boolean;
    });

    return infiniteScroller;
  }
}
