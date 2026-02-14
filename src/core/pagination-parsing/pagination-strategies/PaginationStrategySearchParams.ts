import { getPaginationLinks } from '../pagination-utils';
import { PaginationStrategy } from './PaginationStrategy';

export class PaginationStrategySearchParams extends PaginationStrategy {
  extractPage = (a: HTMLAnchorElement | Location | URL | string): number => {
    const href = typeof a === 'string' ? a : a.href;
    const p = new URL(href).searchParams.get(this.searchParamSelector) as string;
    return parseInt(p) || this.offsetMin;
  };

  getPaginationLast() {
    const links = getPaginationLinks(
      (this.getPaginationElement() || document) as HTMLElement,
      this.url.href,
    ).filter((h) =>
      PaginationStrategySearchParams.checkLink(new URL(h), this.searchParamSelector),
    );
    const pages = links.map(this.extractPage);
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
    return lastPage;
  }

  getPaginationOffset() {
    if (this.doc === document) {
      return this.extractPage(this.url);
    }
    const link = this.getPaginationElement()?.querySelector(
      `a.active[href *= "${this.searchParamSelector}="]`,
    ) as HTMLAnchorElement;
    return this.extractPage(link);
  }

  getPaginationUrlGenerator() {
    const url = new URL(this.url.href);

    const paginationUrlGenerator = (offset: number) => {
      url.searchParams.set(this.searchParamSelector, offset.toString());
      return url.href;
    };

    return paginationUrlGenerator;
  }

  static checkLink(link: URL, searchParamSelector?: string): boolean {
    const searchParamSelectors = ['page', 'p'];
    if (searchParamSelector) searchParamSelectors.push(searchParamSelector);
    return searchParamSelectors.some((p) => link.searchParams.get(p) !== null);
  }

  static testLinks(links: URL[], searchParamSelector?: string) {
    return links.some((h) =>
      PaginationStrategySearchParams.checkLink(h, searchParamSelector),
    );
  }
}
