import { GM_addStyle } from 'vite-plugin-monkey/dist/client';
import type { Rules } from '../rules';
import {
  DataFilterFn,
  type DataFilterFnFrom,
  type DataFilterFnRendered,
} from './data-filter-fn';
import { defaultDataFilterFns } from './data-filter-fn-defaults';

export class DataFilter {
  public filters = new Map<string, () => DataFilterFnRendered>();

  constructor(private rules: Rules) {
    this.registerFilters(rules.customDataFilterFns);
    this.applyCSSFilters();
  }

  public static isFiltered(el: HTMLElement): boolean {
    return el.className.includes('filter-');
  }

  public applyCSSFilters(wrapper?: (cssRule: string) => string) {
    this.filters.forEach((_, name) => {
      const cssRule = `.filter-${name} { display: none !important; }`;
      GM_addStyle(wrapper ? wrapper(cssRule) : cssRule);
    });
  }

  public customDataFilterFns: Record<string, DataFilterFnFrom<any>> = {};

  public registerFilters(
    customFilters: (Record<string, DataFilterFnFrom<any>> | string)[],
  ) {
    customFilters.forEach((o) => {
      const isStr = typeof o === 'string';
      const k = isStr ? o : Object.keys(o)[0];

      this.customDataFilterFns[k] = isStr ? defaultDataFilterFns[o] : o[k];
      this.registerFilter(k);
    });
  }

  public registerFilter(customSelectorName: string) {
    const dataFilterFn = DataFilterFn.from(
      this.customDataFilterFns[customSelectorName],
      customSelectorName,
    );

    [customSelectorName, ...dataFilterFn.deps]?.forEach((name) => {
      Object.assign(this.filterMapping, { [name]: customSelectorName });
    });

    this.filters.set(customSelectorName, dataFilterFn.renderFn(this.rules.store.state));
  }

  public filterMapping: Record<string, string> = {};

  public selectFilters(filters: { [key: string]: boolean }) {
    const selectedFilters = Object.keys(filters)
      .filter((k) => k in this.filterMapping)
      .map((k) => this.filterMapping[k])
      .map((k) => this.filters.get(k) as () => DataFilterFnRendered);
    return selectedFilters;
  }
}
