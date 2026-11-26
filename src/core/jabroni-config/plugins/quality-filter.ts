import type { DataElement } from '../../data-handler';
import type { DataFilterFnFrom } from '../../data-handler/data-filter-fn';
import type { SchemeOptions } from '../default-scheme';

export function createQualityFilter(qualities: Record<string, number | string>) {
  const keys = Object.keys(qualities);
  const entries = Object.entries(qualities);

  function shouldFilter(el: DataElement, state: any) {
    return !entries.some((e) => state[e[0]] && el.quality === e[1]);
  }

  const qualityFilter: DataFilterFnFrom<any> = {
    handle(el, state) {
      const hasAnyQualitySelected = keys.some((q) => !!state[q]);
      if (!hasAnyQualitySelected) return false;
      return shouldFilter(el, state);
    },
    deps: keys,
  };

  const qualityFilterScheme: SchemeOptions = [
    {
      title: 'Quality Filter',
      content: keys.map(k => ({
        [k]: false,
        label: k.substring('quality'.length)
      }))
    },
  ];

  return { qualityFilter, qualityFilterScheme }
}
