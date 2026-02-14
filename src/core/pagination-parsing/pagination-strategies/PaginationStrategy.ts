import { parseUrl } from '../pagination-utils';

export class PaginationStrategy {
  public doc = document;
  public url: URL;
  public paginationSelector = '.pagination';
  public searchParamSelector = 'page';
  public static _pathnameSelector = /\/(page\/)?\d+\/?$/;
  public pathnameSelector = /\/(\d+)\/?$/;
  public dataparamSelector = '[data-parameters *= from]';
  public overwritePaginationLast?: (n: number, offset?: number) => number;
  public offsetMin = 1;

  constructor(options?: Partial<PaginationStrategy>) {
    if (options) {
      Object.entries(options).forEach(([k, v]) => {
        Object.assign(this, { [k]: v });
      });
    }

    this.url = parseUrl(options?.url || this.doc.URL);
  }

  getPaginationElement() {
    return this.doc.querySelector<HTMLElement>(this.paginationSelector);
  }

  get hasPagination() {
    return !!this.getPaginationElement();
  }

  getPaginationOffset() {
    return this.offsetMin;
  }

  getPaginationLast() {
    if (this.overwritePaginationLast) return this.overwritePaginationLast(1);
    return 1;
  }

  getPaginationUrlGenerator(): (offset: number) => string | Promise<string> {
    return (_: number) => this.url.href;
  }
}
