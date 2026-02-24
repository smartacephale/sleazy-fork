import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';
import { fetchHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'E-Hentai PervertMonkey',
  version: '1.0.1',
  description: 'Infinite scroll [optional], Filter by Title',
  match: ['https://*.e-hentai.org/*'],
};

const rules = new Rules({
  thumbs: { selector: '.gl1t' },
  thumb: {
    selectors: {
      title: '.glname'
    }
  },
  thumbImg: {
    selector: 'data-lazy-load',
  },
  containerSelectorLast: '.itg.gld',
  paginationStrategyOptions: createPaginationStrategyOptions(),
  customDataSelectorFns: ['filterInclude', 'filterExclude'],
  schemeOptions: ['Text Filter', 'Badge', 'Advanced'],
});

function createPaginationStrategyOptions(): Rules['paginationStrategyOptions'] {
  let nextLink: string;

  function getPaginationUrlGenerator() {
    function getNextLink(doc: Document | HTMLElement = document) {
      return [...doc.querySelectorAll<HTMLAnchorElement>('a#dnext[href]')].pop()
        ?.href as string;
    }

    const paginationUrlGenerator = async (_: number) => {
      if (!nextLink) {
        nextLink = getNextLink();
        return nextLink;
      }
      // need cache or reuse infinite scroller request
      const doc = await fetchHtml(nextLink);
      nextLink = getNextLink(doc);
      return nextLink;
    };

    return paginationUrlGenerator;
  }

  return {
    paginationSelector: '.searchnav + div + .searchnav',
    overwritePaginationLast: () => 9999999,
    getPaginationUrlGenerator,
  };
}

function setThumbnailMode() {
  const IS_SEARCH_PAGE =
    /f_search/.test(location.search) || /^\/tag\//.test(location.pathname);
  if (!IS_SEARCH_PAGE) return;

  const selectInputT = document.querySelector('option[value=t]') as HTMLOptGroupElement;
  if (selectInputT) {
    const select = selectInputT.parentElement as HTMLOptionElement;
    if (select.value === 't') return;
    select.value = 't';
    select.dispatchEvent(new Event('change'));
  }
}

setThumbnailMode();
