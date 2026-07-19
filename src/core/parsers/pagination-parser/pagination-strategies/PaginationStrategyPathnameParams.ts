import { parseUrl } from '../../../../utils';
import { getPaginationLinks, upgradePathname } from '../pagination-utils';
import { PaginationStrategy } from './PaginationStrategy';

export class PaginationStrategyPathnameParams extends PaginationStrategy {
  extractPage = (a: HTMLAnchorElement | Location | string): number => {
    const href = typeof a === 'string' ? a : a.href;
    const { pathname } = new URL(href, this.doc.baseURI || this.url.origin);
    return parseInt(
      pathname.match(this.pathnameSelector)?.filter(Boolean)?.pop() ||
        this.offsetMin.toString(),
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

    // console.log('this.pathnameSelector', this.pathnameSelector);

    const pathnameSelectorPlaceholder = this.pathnameSelector
      .toString()
      .replace(/\\{1,}/g, '')
      .replace(/[$?()]+/g, '')
      .replace(/\/{1,}/g, '/');

    // console.log({ pathnameSelectorPlaceholder, 'url.pathname': url.pathname });

    if (!this.pathnameSelector.test(url.pathname)) {
      url.pathname = url.pathname
        .concat(pathnameSelectorPlaceholder.replace(/d\+/, this.offsetMin.toString()))
        .replace(/\/{1,}/g, '/');
    }

    // console.log({ pathnameSelectorPlaceholder, 'url.pathname': url.pathname });

    const paginationUrlGenerator = (offset: number) => {
      // console.log({
      //   pathname: url.pathname,
      //   replace: '',
      //   pathnameSelector: this.pathnameSelector,
      //   pathnameSelectorPlaceholder: pathnameSelectorPlaceholder.replace(
      //     /d\+/,
      //     offset.toString(),
      //   ),
      // });

      // pathnameSelectorPlaceholder.replace()
      // need to create tests

      //   url.pathname = url.pathname.replace(
      //     this.pathnameSelector,
      //     (a, b, c, d) => {
      //       console.log({ a, b, c, d, pathnameSelectorPlaceholder });
      //       if (a.length + 1 < pathnameSelectorPlaceholder.length) {
      //         return a.replace(/\d+/, offset.toString());
      //       }
      //       // return a;
      //       return pathnameSelectorPlaceholder.replace(/d\+/, offset.toString());
      //     },
      //     // pathnameSelectorPlaceholder.replace(/d\+/, offset.toString()),
      //   );
      //   return url.href;
      // };

      url.pathname = url.pathname.replace(
        this.pathnameSelector,
        pathnameSelectorPlaceholder.replace(/d\+/, offset.toString()),
      );
      return url.href;
    };

    return paginationUrlGenerator;
  }
}
