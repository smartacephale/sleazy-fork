import { URLPattern } from 'urlpattern-polyfill/urlpattern';

export function parseUrl(s: HTMLAnchorElement | Location | URL | string): URL {
  return new URL(typeof s === 'string' ? s : s.href);
}

export function depaginatePathname(
  url: URL,
  pathnamePaginationSelector = /\/(page\/)?\d+\/?$/,
): URL {
  const newUrl = new URL(url.toString());
  newUrl.pathname = newUrl.pathname.replace(pathnamePaginationSelector, '/');
  return newUrl;
}

export function getPaginationLinks(
  doc: Element | HTMLElement | Document = document,
  url: Location | URL | string = location.href,
  pathnamePaginationSelector = /\/(page\/)?\d+\/?$/,
): string[] {
  const baseUrl = depaginatePathname(parseUrl(url), pathnamePaginationSelector);
  const pathnameStrict = doc instanceof Document;
  const host = doc.baseURI || baseUrl.origin;

  const urlPattern = new URLPattern({
    pathname: pathnameStrict ? `${baseUrl.pathname}*` : '*',
    hostname: baseUrl.hostname,
  });

  const pageLinks = [...doc.querySelectorAll<HTMLAnchorElement>('a[href]')]
    .map((a) => a.href)
    .filter((h) => URL.canParse(h));

  return pageLinks.filter((h) => {
    return urlPattern.test(new URL(h, host));
  });
}

/**
 * Nonsens
 * WTF IS THIS? JFC...
 * @description
 * curr: website.com, links: [webiste.com/new/23] => wegsite.com/new
 */
export function upgradePathname(
  curr: URL,
  links: URL[],
  pathnamePaginationSelector = /\/(page\/)?\d+\/?$/,
): URL {
  if (pathnamePaginationSelector.test(curr.pathname) || links.length < 1) return curr;

  const linksDepaginated = links.map((l) =>
    depaginatePathname(l, pathnamePaginationSelector),
  );

  if (linksDepaginated.some((l) => l.pathname === curr.pathname)) return curr;

  const last = linksDepaginated.at(-1) as URL;
  if (last.pathname !== curr.pathname) curr.pathname = last.pathname;
  return curr;
}

/**
 * @description
 * website.com/search => website.com/search+word1...+-word2
 */
export function applyUrlLevelSearchFilters(
  searchFilter: string,
  queryType: keyof Pick<Location, 'pathname' | 'search'>,
): void {
  const wordsToFilter =
    searchFilter.replace(/f:/g, '').match(/(?<!user:)\b\w+\b(?!\s*:)/g) || [];

  if (!wordsToFilter.some((w) => !location.href.includes(w))) return;

  let query = location[queryType];

  wordsToFilter.forEach((w) => {
    if (query.includes(w)) return;
    query += `+-${w.trim()}`;
  });

  window.location[queryType] = query;
}
