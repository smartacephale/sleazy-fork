import type { JabroniTypes, SchemeInput, setupScheme } from 'jabroni-outfit';

export const DefaultScheme = [
  {
    title: 'Text Filter',
    collapsed: true,
    content: [
      { filterExclude: false, label: 'exclude' },
      {
        filterExcludeWords: '',
        label: 'keywords',
        watch: 'filterExclude',
        placeholder: 'word, f:full_word, r:RegEx...',
      },
      { filterInclude: false, label: 'include' },
      {
        filterIncludeWords: '',
        label: 'keywords',
        watch: 'filterInclude',
        placeholder: 'word, f:full_word, r:RegEx...',
      },
    ],
  },
  {
    title: 'Duration Filter',
    collapsed: true,
    content: [
      { filterDuration: false, label: 'enable' },
      {
        filterDurationFrom: 0,
        watch: 'filterDuration',
        label: 'from',
        type: 'time',
      },
      {
        filterDurationTo: 600,
        watch: 'filterDuration',
        label: 'to',
        type: 'time',
      },
    ],
  },
  {
    title: 'Sort By',
    content: [
      {
        'sort by views': () => {},
      },
      {
        'sort by duration': () => {},
      },
    ],
  },
  {
    title: 'Privacy Filter',
    content: [
      { filterPrivate: false, label: 'private' },
      { filterPublic: false, label: 'public' },
      { 'check access 🔓': () => {} },
    ],
  },
  {
    title: 'Advanced',
    collapsed: true,
    content: [
      {
        infiniteScrollEnabled: true,
        label: 'infinite scroll',
      },
      {
        autoScroll: false,
        label: 'auto scroll',
      },
      {
        delay: 250,
        label: 'scroll delay',
      },
      {
        writeHistory: false,
        label: 'write history',
      },
    ],
  },
  {
    title: 'Badge',
    content: [
      {
        text: 'return `${state.$paginationOffset}/${state.$paginationLast}`',
        vif: 'return state.$paginationLast > 1',
      },
    ],
  },
] as const satisfies SchemeInput;

export type SchemeOptions = (
  | Parameters<typeof setupScheme>[0][0]
  | JabroniTypes.ExtractValuesByKey<typeof DefaultScheme, 'title'>
)[];
