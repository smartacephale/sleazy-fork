import type { StoreState } from 'jabroni-outfit';
import { areElementsAlike, containMutation, LazyImgLoader, runIdleJob } from '../../utils';
import type { Rules } from '../rules';
import { DataFilter } from './data-filter';

export type DataElement = {
  element: HTMLElement;
  [key: string]: HTMLElement | string | number | boolean;
};

export class DataManager {
  public data = new Map<string, DataElement>();
  private lazyImgLoader = new LazyImgLoader(
    (target: Element) => !DataFilter.isFiltered(target as HTMLElement),
  );
  public dataFilter: DataFilter;

  constructor(
    private rules: Rules,
    private containerHomogenity?: Parameters<typeof areElementsAlike>[2],
  ) {
    this.dataFilter = new DataFilter(this.rules);
  }

  public async applyFilters(
    filters: Record<string, boolean> = {},
    offset = 0,
  ): Promise<void> {
    const filtersToApply = this.dataFilter.selectFilters(filters);
    if (filtersToApply.length === 0) return;

    const iterator = this.data.values().drop(offset);

    const updates: { e: HTMLElement; name: string; condition: boolean }[] = [];

    await runIdleJob(iterator, (v) => {
      for (const f of filtersToApply) {
        const { name, condition } = f()(v);
        updates.push({ e: v.element as HTMLElement, name, condition });
      }
    });

    const parents = Map.groupBy(updates, (u) => u.e.parentElement);

    parents.forEach((v, parent) => {
      const f = () => {
        v.forEach((u) => {
          u.e.classList.toggle(u.name, u.condition);
        });
      };

      if (!parent) {
        f();
      } else {
        requestAnimationFrame(() => {
          this.optimize(parent, f);
        });
      }
    });
  }

  public async filterAll(offset?: number): Promise<void> {
    const keys = Array.from(this.dataFilter.filters.keys());
    const filters = Object.fromEntries(
      keys.map((k) => [k, this.rules.store.state[k as keyof StoreState]]),
    ) as Record<string, boolean>;

    await this.applyFilters(filters, offset);
  }

  public async parseData(
    html: HTMLElement,
    container?: HTMLElement,
    removeDuplicates = false,
    shouldLazify = true,
  ) {
    const thumbs = this.rules.thumbsParser.getThumbs(html);
    const dataOffset = this.data.size;
    const fragment = document.createDocumentFragment();
    const parent = container || this.rules.container;
    const homogenity = !!this.containerHomogenity;

    for (const thumbElement of thumbs) {
      const url = this.rules.thumbDataParser.getUrl(thumbElement);

      const isNotHomogenic =
        homogenity &&
        !areElementsAlike(
          parent,
          thumbElement.parentElement as HTMLElement,
          this.containerHomogenity as object,
        );

      if (
        !url ||
        this.data.has(url) ||
        (parent !== container && parent?.contains(thumbElement)) ||
        isNotHomogenic
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

    await this.filterAll(dataOffset);

    if (!parent) return;
    this.optimize(parent, () => parent?.appendChild(fragment));
  }

  private optimize(container: HTMLElement, mutation: () => void) {
    if (this.rules.containMutationEnabled) {
      containMutation(container, mutation);
    } else {
      mutation();
    }
  }

  public sortBy<K extends keyof DataElement>(key: K, direction = true): void {
    if (this.data.size < 2) return;

    const ds = this.data
      .values()
      .toArray()
      .filter((e) => e.element.parentElement !== null);

    const byContainers = Map.groupBy(ds, (e) => e.element.parentElement as HTMLElement);

    const dir = direction ? -1 : 1;

    for (const [container, items] of byContainers) {
      items.sort((a, b) => ((a[key] as number) - (b[key] as number)) * dir);
      const children = items.map((e) => e.element);
      this.optimize(container, () => container.replaceChildren(...children));
    }
  }
}
