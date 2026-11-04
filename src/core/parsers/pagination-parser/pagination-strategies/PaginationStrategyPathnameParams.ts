import { parseUrl } from '../../../../utils';
import { getPaginationLinks, upgradePathname } from '../pagination-utils';
import { PaginationStrategy } from './PaginationStrategy';

/** Non-global copy with the `d` flag so we get capture group indices. */
const withIndices = (re: RegExp): RegExp => {
  const flags = `${re.flags.replace(/[gyd]/g, '')}d`;
  return new RegExp(re.source, flags);
};

interface PageSpan {
  start: number;
  end: number;
  value: number;
}

/**
 * Locate the page number inside a pathname.
 * Uses the last all-digit capture group; if the selector has none,
 * falls back to the last digit run inside the whole match.
 */
const findPageSpan = (pathname: string, selector: RegExp): PageSpan | null => {
  const m = withIndices(selector).exec(pathname);
  if (!m) return null;
  const indices = (m as RegExpExecArray & { indices: Array<[number, number] | undefined> })
    .indices;

  for (let i = indices.length - 1; i >= 1; i--) {
    const idx = indices[i];
    if (idx && /^\d+$/.test(m[i])) {
      return { start: idx[0], end: idx[1], value: parseInt(m[i], 10) };
    }
  }

  const digits = [...m[0].matchAll(/\d+/g)].pop();
  if (!digits) return null;
  const start = m.index + digits.index!;
  return { start, end: start + digits[0].length, value: parseInt(digits[0], 10) };
};

export class PaginationStrategyPathnameParams extends PaginationStrategy {
  extractPage = (a: HTMLAnchorElement | Location | string): number => {
    const href = typeof a === 'string' ? a : a.href;
    const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
    return findPageSpan(pathname, this.pathnameSelector)?.value ?? this.offsetMin;
  };

  static checkLink(
    link: URL,
    pathnameSelector: RegExp = PaginationStrategy._pathnameSelector,
  ): boolean {
    // non-global copy: .test() on a /g regex is stateful (lastIndex)
    return new RegExp(pathnameSelector.source, pathnameSelector.flags.replace(/[gy]/g, '')).test(
      link.pathname,
    );
  }

  static testLinks(links: URL[], options: Partial<PaginationStrategy>): boolean {
    const pathnamesMatched = links.filter((h) =>
      PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector),
    );

    if (pathnamesMatched.length === 0) return false;

    options.url = upgradePathname(parseUrl(options.url as unknown as string), pathnamesMatched);
    return true;
  }

  getPaginationLast() {
    const links = getPaginationLinks(
      (this.getPaginationElement() || document) as HTMLElement,
      this.url.href,
      this.pathnameSelector,
    );
    const pages = Array.from(links, this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
    return lastPage;
  }

  getPaginationOffset() {
    return this.extractPage(this.url.href);
  }

  getPaginationUrlGenerator(url_: URL = this.url) {
    const base = new URL(url_.href);

    // Current URL has no page segment (e.g. page 1 is /blabla/): append one.
    if (!findPageSpan(base.pathname, this.pathnameSelector)) {
      base.pathname = `${base.pathname}${this.getPlaceholder(this.offsetMin)}`.replace(
        /\/{2,}/g,
        '/',
      );
    }

    const span = findPageSpan(base.pathname, this.pathnameSelector);

    // Selector still can't locate a number: last-resort append.
    if (!span) {
      return (offset: number) => {
        const u = new URL(url_.href);
        u.pathname = `${u.pathname}/${offset}`.replace(/\/{2,}/g, '/');
        return u.href;
      };
    }

    const before = base.pathname.slice(0, span.start);
    const after = base.pathname.slice(span.end);

    return (offset: number) => {
      const u = new URL(base.href); // don't mutate shared state
      u.pathname = `${before}${offset}${after}`;
      return u.href;
    };
  }

  /** Builds e.g. "/page/2/" from a selector like /\/page\/(\d+)\/?$/ — only used when the page is absent from the URL. */
  private getPlaceholder(offset: number): string {
    return this.pathnameSelector
      .source.replace(/\\(.)/g, '$1') // unescape
      .replace(/\(\?:/g, '(') // non-capturing -> plain
      .replace(/\(\?[=!<][^)]*\)/g, '') // drop lookarounds
      .replace(/[$^?()]/g, '')
      .replace(/d\+/, String(offset))
      .replace(/\/{2,}/g, '/');
  }
}