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
  public filterDepsMapping: Record<string, string> = {};

  constructor(private rules: Rules) {
    this.registerFilters(rules.customDataFilterFns);
    this.createCssFilters();
  }

  public static isFiltered(e: HTMLElement): boolean {
    return e.className.includes(DataFilterFn.prefix);
  }

  public createCssFilters(wrapper?: (cssRule: string) => string) {
    this.filters.forEach((_, name) => {
      const className = DataFilterFn.setPrefix(name);
      const cssRule = `.${className} { display: none !important; }`;
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

    dataFilterFn.deps.push(customSelectorName);

    dataFilterFn.deps.forEach((name) => {
      Object.assign(this.filterDepsMapping, { [name]: customSelectorName });
    });

    this.filters.set(customSelectorName, dataFilterFn.renderFn(this.rules.store.state));
  }

  public selectFilters(filters: { [key: string]: boolean }) {
    const selectedFilters = Object.keys(filters)
      .filter((k) => k in this.filterDepsMapping)
      .map((k) => this.filterDepsMapping[k])
      .map((k) => this.filters.get(k) as () => DataFilterFnRendered);
    return selectedFilters;
  }
}
