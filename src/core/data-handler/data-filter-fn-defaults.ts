import { RegexFilter } from '../../utils';
import type { DataFilterFnFrom } from './data-filter-fn';

function createTextFilter(
  filterName: string,
  dataPropName: string,
  positive: boolean,
): DataFilterFnFrom<(_: string) => boolean> {
  const filterNameValue = `${filterName}Words`;
  return {
    handle(e, state, searchFilter) {
      if (!Object.hasOwn(state, filterName) || !state[filterName]) return false;
      return !searchFilter?.(e[dataPropName] as string);
    },
    $preDefine: (state) => {
      const r = new RegexFilter(state[filterNameValue] as string);
      if (positive) return (s: string) => r.hasEvery(s);
      return (s: string) => r.hasNone(s);
    },
    deps: [filterNameValue],
  };
}

const filterDuration: DataFilterFnFrom<(_: number) => boolean> = {
  handle(e, state, notInRange) {
    if (!state.filterDuration) return false;
    return !!notInRange?.(e.duration as number);
  },
  $preDefine: (state) => {
    const from = state.filterDurationFrom as number;
    const to = state.filterDurationTo as number;
    function notInRange(d: number): boolean {
      return d < from || d > to;
    }
    return notInRange;
  },
  deps: ['filterDurationFrom', 'filterDurationTo'],
};

export const defaultDataFilterFns: Record<string, DataFilterFnFrom<any>> = {
  filterDuration,

  filterExclude: createTextFilter('filterExclude', 'title', false),
  filterInclude: createTextFilter('filterInclude', 'title', true),
  filterUploaderExclude: createTextFilter('filterUploaderExclude', 'uploader', false),
  filterUploaderInclude: createTextFilter('filterUploaderInclude', 'uploader', true),

  filterHD: (e, state) => (state.filterHD && !e.hd) as boolean,
  filterNonHD: (e, state) => (state.filterNonHD && e.hd) as boolean,
  filterPrivate: (e, state) => (state.filterPrivate && e.private) as boolean,
  filterPublic: (e, state) => (state.filterPublic && !e.private) as boolean,
};
