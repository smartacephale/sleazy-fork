import { parseDataParams } from '../../../../utils';
import { PaginationStrategy } from './PaginationStrategy';

export class PaginationStrategyDataParams extends PaginationStrategy {
  getPaginationLast() {
    const links = this.getPaginationElement()?.querySelectorAll(this.dataparamSelector);
    const pages = Array.from(links || [], (l) => {
      const p = l.getAttribute('data-parameters');
      const v = p?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
      return parseInt(v);
    });
    const lastPage = Math.max(...pages, this.offsetMin);
    if (this.overwritePaginationLast) return this.overwritePaginationLast(lastPage);
    return lastPage;
  }

  getPaginationOffset() {
    const link = this.getPaginationElement()?.querySelector(
      '.prev[data-parameters *= from], .prev [data-parameters *= from]',
    );
    if (!link) return this.offsetMin;
    const p = link.getAttribute('data-parameters');
    const v = p?.match(/from\w*:(\d+)/)?.[1] || this.offsetMin.toString();
    return parseInt(v);
  }

  getPaginationUrlGenerator() {
    const url = new URL(this.url.href);

    const parametersElement = this.getPaginationElement()?.querySelector(
      'a[data-block-id][data-parameters]',
    );
    const block_id = parametersElement?.getAttribute('data-block-id') || '';
    const parameters = parseDataParams(
      parametersElement?.getAttribute('data-parameters') || '',
    );

    const attrs: Record<string, string> = {
      block_id,
      function: 'get_block',
      mode: 'async',
      ...parameters,
    };

    Object.keys(attrs).forEach((k) => {
      url.searchParams.set(k, attrs[k]);
    });

    const paginationUrlGenerator = (n: number) => {
      Object.keys(attrs).forEach((k) => {
        k.includes('from') && url.searchParams.set(k, n.toString());
      });
      url.searchParams.set('_', Date.now().toString());
      return url.href;
    };

    return paginationUrlGenerator;
  }

  static testLinks(doc: HTMLElement | Document = document) {
    const dataParamLinks = Array.from(
      doc.querySelectorAll<HTMLElement>('[data-parameters *= from]'),
    );
    return dataParamLinks.length > 0;
  }
}
