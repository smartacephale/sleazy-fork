import type { StoreState } from 'jabroni-outfit';
import { GM_addStyle } from '$';
import { RegexFilter } from '../../utils/strings/regexes';
import type { RulesGlobal } from '../rules';
import type { DataElement } from './data-manager';

export type DataSelectorFnShort = (e: DataElement, state: StoreState) => boolean;

export type DataSelectorFnAdvanced<R> = {
  handle: (el: DataElement, state: StoreState, $preDefineResult?: R) => boolean;
  $preDefine?: (state: StoreState) => R;
  deps?: string[];
};

export type DataSelectorFn<R> = DataSelectorFnAdvanced<R> | DataSelectorFnShort;

interface DataFilterResult {
  tag: string;
  condition: boolean;
}

export type DataFilterFn = (v: DataElement) => DataFilterResult;

export class DataFilter {
  public filters = new Map<string, () => DataFilterFn>();

  constructor(private rules: RulesGlobal) {
    this.registerFilters(rules.customDataSelectorFns);
    this.applyCSSFilters();
  }

  public static isFiltered(el: HTMLElement): boolean {
    return el.className.includes('filter-');
  }

  public applyCSSFilters(wrapper?: (cssRule: string) => string) {
    this.filters.forEach((_, name) => {
      const cssRule = `.filter-${name} { display: none !important; }`;
      // this.appliedStyle = GM_addStyle();
      if (wrapper) {
        GM_addStyle(wrapper(cssRule));
      } else {
        GM_addStyle(cssRule);
      }
    });
  }

  public customDataSelectorFns: Record<string, DataSelectorFn<any>> = {};

  public registerFilters(customFilters: (Record<string, DataSelectorFn<any>> | string)[]) {
    customFilters.forEach((o) => {
      if (typeof o === 'string') {
        this.customDataSelectorFns[o] = DataFilter.customDataSelectorFnsDefault[o];
        this.registerFilter(o);
      } else {
        const k = Object.keys(o)[0];
        this.customDataSelectorFns[k] = o[k];
        this.registerFilter(k);
      }
    });
  }

  private customSelectorParser<T>(
    name: string,
    selector: DataSelectorFn<T>,
  ): DataSelectorFnAdvanced<T> {
    if ('handle' in selector) {
      return selector as DataSelectorFnAdvanced<T>;
    } else {
      return { handle: selector, deps: [name] } as DataSelectorFnAdvanced<T>;
    }
  }

  public registerFilter(customSelectorName: string) {
    const handler = this.customSelectorParser(
      customSelectorName,
      this.customDataSelectorFns[customSelectorName],
    );
    const tag = `filter-${customSelectorName}`;

    [customSelectorName, ...(handler.deps || [])]?.forEach((name) => {
      Object.assign(this.filterMapping, { [name]: customSelectorName });
    });

    const fn = (): DataFilterFn => {
      const preDefined = handler.$preDefine?.(this.rules.store.state);

      return (v: DataElement) => {
        const condition = handler.handle(v, this.rules.store.state, preDefined);

        return {
          condition,
          tag,
        };
      };
    };

    this.filters.set(customSelectorName, fn);
  }

  public filterMapping: Record<string, string> = {};

  public selectFilters(filters: { [key: string]: boolean }) {
    const selectedFilters = Object.keys(filters)
      .filter((k) => k in this.filterMapping)
      .map((k) => this.filterMapping[k])
      .map((k) => this.filters.get(k) as () => DataFilterFn);
    return selectedFilters;
  }

  static customDataSelectorFnsDefault: Record<string, DataSelectorFn<any>> = {
    filterDuration: {
      handle(el, state, notInRange) {
        return (state.filterDuration as boolean) && notInRange(el.duration);
      },
      $preDefine: (state) => {
        const from = state.filterDurationFrom as number;
        const to = state.filterDurationTo as number;
        function notInRange(d: number) {
          return d < from || d > to;
        }
        return notInRange;
      },
      deps: ['filterDurationFrom', 'filterDurationTo'],
    },
    filterExclude: {
      handle(el, state, searchFilter) {
        if (!state.filterExclude) return false;
        return !(searchFilter as RegexFilter).hasNone(el.title as string);
      },
      $preDefine: (state) => new RegexFilter(state.filterExcludeWords as string),
      deps: ['filterExcludeWords'],
    },
    filterInclude: {
      handle(el, state, searchFilter) {
        if (!state.filterInclude) return false;
        return !(searchFilter as RegexFilter).hasEvery(el.title as string);
      },
      $preDefine: (state) => new RegexFilter(state.filterIncludeWords as string),
      deps: ['filterIncludeWords'],
    },
  };
}
