import type { StoreState } from 'jabroni-outfit';
import { checkHomogenity, LazyImgLoader } from '../../utils';
import type { Rules } from '../rules';
import { DataFilter } from './data-filter';

export type DataElement = Record<string, string | number | boolean | HTMLElement>;

export class DataManager {
  public data = new Map<string, DataElement>();
  private lazyImgLoader = new LazyImgLoader(
    (target: Element) => !DataFilter.isFiltered(target as HTMLElement),
  );
  public dataFilter: DataFilter;

  constructor(
    private rules: Rules,
    private parentHomogenity?: Parameters<typeof checkHomogenity>[2],
  ) {
    this.dataFilter = new DataFilter(this.rules);
  }

  public applyFilters = async (
    filters: Record<string, boolean> = {},
    offset = 0,
  ): Promise<void> => {
    const filtersToApply = this.dataFilter.selectFilters(filters);
    if (filtersToApply.length === 0) return;

    const iterator = this.data.values().drop(offset);
    let finished = false;

    await new Promise((resolve) => {
      function runBatch(deadline: IdleDeadline) {
        const updates: { e: HTMLElement; tag: string; condition: boolean }[] = [];

        while (deadline.timeRemaining() > 0) {
          const { value, done } = iterator.next();
          finished = !!done;
          if (done) break;

          for (const f of filtersToApply) {
            const { tag, condition } = f()(value);
            updates.push({ e: value.element as HTMLElement, tag, condition });
          }
        }

        if (updates.length > 0) {
          requestAnimationFrame(() => {
            updates.forEach((u) => {
              u.e.classList.toggle(u.tag, u.condition);
            });
          });
        }

        if (!finished) {
          requestIdleCallback(runBatch);
        } else {
          resolve(true);
        }
      }

      requestIdleCallback(runBatch);
    });
  };

  public filterAll = async (offset?: number): Promise<void> => {
    const keys = Array.from(this.dataFilter.filters.keys());
    const filters = Object.fromEntries(
      keys.map((k) => [k, this.rules.store.state[k as keyof StoreState]]),
    ) as Record<string, boolean>;

    await this.applyFilters(filters, offset);
  };

  public parseData = (
    html: HTMLElement,
    container?: HTMLElement,
    removeDuplicates = false,
    shouldLazify = true,
  ): void => {
    const thumbs = this.rules.thumbsParser.getThumbs(html);
    const dataOffset = this.data.size;
    const fragment = document.createDocumentFragment();
    const parent = container || this.rules.container;
    const homogenity = !!this.parentHomogenity;

    for (const thumbElement of thumbs) {
      const url = this.rules.thumbDataParser.getUrl(thumbElement);
      if (
        !url ||
        this.data.has(url) ||
        (parent !== container && parent?.contains(thumbElement)) ||
        (homogenity &&
          !checkHomogenity(
            parent,
            thumbElement.parentElement as HTMLElement,
            this.parentHomogenity as object,
          ))
      ) {
        if (removeDuplicates) thumbElement.remove();
        continue;
      }

      const data = this.rules.thumbDataParser.getThumbData(thumbElement);
      this.data.set(url, { element: thumbElement, ...data });

      if (shouldLazify) {
        const { img, imgSrc } = this.rules.thumbImgParser.getImgData(thumbElement);
        this.lazyImgLoader.lazify(thumbElement, img, imgSrc);
      }

      fragment.append(thumbElement);
    }

    this.filterAll(dataOffset).then(() => {
      requestAnimationFrame(() => {
        parent.appendChild(fragment);
      });
    });
  };

  public sortBy<K extends keyof DataElement>(key: K, direction = true): void {
    if (this.data.size < 2) return;

    let sorted: DataElement[] = this.data
      .values()
      .toArray()
      .sort((a: DataElement, b: DataElement) => {
        return (a[key] as number) - (b[key] as number);
      });

    if (!direction) sorted = sorted.reverse();

    const container = (sorted[0].element as HTMLElement).parentElement as HTMLElement;

    container.style.visibility = 'hidden';

    sorted.forEach((s) => {
      container.append(s.element as HTMLElement);
    });

    container.style.visibility = 'visible';
  }
}
