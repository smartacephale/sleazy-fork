import type { MonkeyUserScript } from 'vite-plugin-monkey';
import { RulesGlobal } from '../../core';
import { parseHtml } from '../../utils';

export const meta: MonkeyUserScript = {
  name: 'NHentai PervertMonkey',
  version: '4.0.0',
  description: 'Infinite scroll [optional], Filter by Title',
  match: ['https://*.nhentai.*/*', 'https://*.nhentai.net/*'],
  icon: 'https://www.google.com/s2/favicons?sz=64&domain=nhentai.net',
};

const IS_TITLE_PAGE = /^\/g\/\d+/.test(location.pathname);
const IS_SEARCH_PAGE = /^\/search\//.test(location.pathname);

const nhentaiRules = new RulesGlobal({
  getThumbImgDataAttrDelete: 'auto',
  getThumbImgDataStrategy: 'auto',
  thumbsSelector: '.gallery',
  containerSelectorLast: '.index-container, .container',
  titleSelector: '.caption',
  customDataSelectorFns: ['filterInclude', 'filterExclude'],
  schemeOptions: ['Text Filter', 'Badge', 'Advanced'],
  gropeStrategy: 'all-in-all',
});

// 2026: now only one language works, problem in nhentai.net itself
const filterDescriptors = {
  english: { query: 'english', name: '🇬🇧' },
  japanese: { query: 'japanese', name: '🇯🇵' },
  chinese: { query: 'chinese', name: '🇨🇳' },
  gay: { query: '-gay', name: 'Exclude Gay' },
  fullColor: { query: 'color', name: 'Full Color' },
} as const;

function checkURL(url_: string) {
  return Object.keys(filterDescriptors).reduce((url, k) => {
    const q = filterDescriptors[k as keyof typeof filterDescriptors].query;
    return (nhentaiRules.store.state.custom as unknown as Record<string, boolean>)[k]
      ? url.includes(q)
        ? url
        : `${url}+${q}`
      : url.replace(`+${q}`, () => '');
  }, url_);
}

function filtersUI() {
  const state = nhentaiRules.store.state as any;
  const btnContainer = Array.from(document.querySelectorAll('.sort-type')).pop();
  const descs = Array.from(Object.keys(filterDescriptors));
  [descs.slice(0, 3), [descs[3]], [descs[4]]].forEach((groupOfButtons) => {
    const btns = parseHtml(`<div class="sort-type"></div>`);
    groupOfButtons.forEach((k) => {
      const btn = parseHtml(
        `<a href="#" ${
          state.custom[k] ? 'style="background: rgba(59, 49, 70, 1)"' : ''
        }>${filterDescriptors[k as keyof typeof filterDescriptors].name}</a>`,
      );
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        state.custom[k] = !state.custom[k];
        location.href = checkURL(location.href);
      });
      btns.append(btn);
    });
    btnContainer?.after(btns);
  });
  const fixedURL = checkURL(location.href);
  if (location.href !== fixedURL) location.href = checkURL(location.href);
}

function findSimilar() {
  let tags = Array.from(
    document.querySelectorAll<HTMLElement>('.tags .tag[href^="/tag/"] .name'),
  )
    .map((tag) => tag.innerText)
    .join(' ')
    .split(' ');
  tags = Array.from(new Set(tags)).sort((a, b) => a.length - b.length);

  const urls = {
    searchSimilar: `/search/?q=${tags.slice(0, 5).join('+')}`,
    searchSimilarLess: `/search/?q=${tags.reverse().slice(0, 5).join('+')}`,
  };

  Object.keys(urls).forEach((url) => {
    urls[url as keyof typeof urls] = checkURL(urls[url as keyof typeof urls]);
  });

  Array.from(document.links)
    .filter((l) =>
      /\/(search|category|tag|character|artist|group|parody)\/\w+/.test(l.href),
    )
    .forEach((l) => {
      l.href = checkURL(
        l.href
          .replace(/(search|category|tag|character|artist|group|parody)\//, 'search/?q=')
          .replace(/\/$/, ''),
      );
    });

  document
    .querySelector('.buttons')
    ?.append(
      parseHtml(
        `<a href="${urls.searchSimilar}" class="btn" style="background: rgba(59, 49, 70, 1)"><i class="fa fa-search"></i> Similar</a>`,
      ),
      parseHtml(
        `<a href="${urls.searchSimilarLess}" class="btn" style="background: rgba(59, 49, 70, .9)"><i class="fa fa-search"></i> Less Similar</a>`,
      ),
    );
}

function route() {
  if (!nhentaiRules.store.state.custom) {
    const custom = Object.entries(filterDescriptors).reduce(
      (acc, [k, _]) => {
        acc[k] = false;
        return acc;
      },
      {} as Record<string, any>,
    );
    Object.assign(nhentaiRules.store.state, { custom });
  }

  if (IS_TITLE_PAGE) {
    findSimilar();
  }

  if (IS_SEARCH_PAGE) {
    filtersUI();
  }
}

route();
