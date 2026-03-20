import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { Rules } from '../../core';
import { fetchHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'E-Hentai PervertMonkey',
  version: '1.0.16',
  description: 'Infinite scroll [optional], Filter by Title',
  match: ['https://*.e-hentai.org/*'],
};

const rules = new Rules({
  thumbs: { selector: '.gl1t' },
  thumb: {
    selectors: {
      title: '.glname',
    },
  },
  thumbImg: {
    selector: 'data-lazy-load',
  },
  containerSelectorLast: '.itg.gld',
  paginationStrategyOptions: createPaginationStrategyOptions(),
  schemeOptions: ['Title Filter', 'Badge', 'Advanced'],
});

function createPaginationStrategyOptions(): Rules['paginationStrategyOptions'] {
  let nextLink: string;

  function getNextLink(doc: Document | HTMLElement = document) {
    return [...doc.querySelectorAll<HTMLAnchorElement>('a#dnext[href]')].pop()
      ?.href as string;
  }

  function getPaginationUrlGenerator() {
    const paginationUrlGenerator = async (_: number) => {
      if (!nextLink) {
        nextLink = getNextLink();
        return nextLink;
      }
      const doc = await fetchHtml(nextLink);
      nextLink = getNextLink(doc);
      return nextLink;
    };

    return paginationUrlGenerator;
  }

  const totalTitles = Number.parseInt(getNextLink()?.match(/\d+$/)?.[0] || '0');

  return {
    paginationSelector: '.searchnav + div + .searchnav',
    overwritePaginationLast: () => totalTitles,
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
