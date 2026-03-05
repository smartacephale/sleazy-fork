import { defaultDataFilterFns } from '../data-handler/data-filter-fn-defaults';
import { DefaultScheme, type SchemeKeys } from './default-scheme';

export function getSelectorFnsFromScheme(xs: SchemeKeys[]) {
  const keys = xs.flatMap((s) => {
    const schemeBlock = DefaultScheme.find((e) => e.title === s);
    if (!schemeBlock) return [];
    return schemeBlock.content.flatMap((c) => Object.keys(c));
  });

  return keys.filter((k) => k in defaultDataFilterFns);
}
