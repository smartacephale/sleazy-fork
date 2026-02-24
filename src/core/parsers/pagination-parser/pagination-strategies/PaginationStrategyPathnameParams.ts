import { parseUrl } from '../../../../utils';
import { getPaginationLinks, upgradePathname } from '../pagination-utils';
import { PaginationStrategy } from './PaginationStrategy';

export class PaginationStrategyPathnameParams extends PaginationStrategy {
  extractPage = (a: HTMLAnchorElement | Location | string): number => {
    const href = typeof a === 'string' ? a : a.href;
    const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
    return parseInt(
      pathname.match(this.pathnameSelector)?.pop() || this.offsetMin.toString(),
    );
  };

  static checkLink(
    link: URL,
    pathnameSelector: RegExp = PaginationStrategy._pathnameSelector,
  ): boolean {
    return pathnameSelector.test(link.pathname);
  }

  static testLinks(links: URL[], options: Partial<PaginationStrategy>): boolean {
    const result = links.some((h) =>
      PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector),
    );

    if (result) {
      const pathnamesMatched = links.filter((h) =>
        PaginationStrategyPathnameParams.checkLink(h, options.pathnameSelector),
      );
      options.url = upgradePathname(
        parseUrl(options.url as unknown as string),
        pathnamesMatched,
      );
    }

    return result;
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
    const url = new URL(url_.href);

    const pathnameSelectorPlaceholder = this.pathnameSelector
      .toString()
      .replace(/[/|\\|$|?|(|)]+/g, '/');

    if (!this.pathnameSelector.test(url.pathname)) {
      url.pathname = url.pathname
        .concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString()))
        .replace(/\/{2,}/g, '/');
    }

    const paginationUrlGenerator = (offset: number) => {
      url.pathname = url.pathname.replace(
        this.pathnameSelector,
        pathnameSelectorPlaceholder.replace(/d\+/, offset.toString()),
      );
      return url.href;
    };

    return paginationUrlGenerator;
  }
}
