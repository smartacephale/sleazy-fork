import type { StoreState } from 'jabroni-outfit';
import { checkHomogenity, LazyImgLoader } from '../../utils';
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
    private containerHomogenity?: Parameters<typeof checkHomogenity>[2],
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

    const updates: { e: HTMLElement; tag: string; condition: boolean }[] = [];

    await new Promise((resolve) => {
      function runBatch(deadline: IdleDeadline) {
        while (deadline.timeRemaining() > 0) {
          const { value, done } = iterator.next();
          finished = !!done;
          if (done) break;

          for (const f of filtersToApply) {
            const { tag, condition } = f()(value);
            updates.push({ e: value.element as HTMLElement, tag, condition });
          }
        }

        if (!finished) {
          requestIdleCallback(runBatch);
        } else {
          resolve(true);
        }
      }

      requestIdleCallback(runBatch);
    });

    const parents = new Set(updates.map((u) => u.e.parentElement));

    requestAnimationFrame(() => {
      const revertDisplayStyle = [...parents].map((p) => {
        const display = p?.style.display;
        if (!display) return undefined;
        p.style.display = 'none';
        p.style.contain = 'layout style paint';
        p.style.willChange = 'contents';
        return () => {
          p.style.display = display;
          requestAnimationFrame(() => {
            p.style.willChange = 'auto';
          });
        };
      });

      updates.forEach((u) => {
        u.e.classList.toggle(u.tag, u.condition);
      });

      revertDisplayStyle.forEach((f) => {
        f?.();
      });
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
    const homogenity = !!this.containerHomogenity;

    if (parent) {
      parent.style.contain = 'layout style paint';
      parent.style.willChange = 'contents';
    }

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
            this.containerHomogenity as object,
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
        parent?.appendChild(fragment);
      });
    });
  };

  public sortBy<K extends keyof DataElement>(key: K, direction = true): void {
    if (this.data.size < 2) return;

    const elements = this.data
      .values()
      .toArray()
      .filter((e) => e.element.parentElement !== null)
      .map((e) => e);

    const containers = new Set(elements.map((e) => e.element.parentElement as HTMLElement));
    containers.forEach((c) => {
      c.style.contain = 'layout style paint';
      c.style.willChange = 'contents';
    });

    const elementsByContainers = new Map<HTMLElement, DataElement[]>();
    containers.forEach((c) => {
      elementsByContainers.set(c, []);
    });

    elements.forEach((e) => {
      const parent = e.element.parentElement as HTMLElement;
      const container = elementsByContainers.get(parent);
      container?.push(e);
    });

    const dir = direction ? -1 : 1;

    for (const [container, items] of elementsByContainers) {
      items.sort((a, b) => ((a[key] as number) - (b[key] as number)) * dir);
      const domNodes = items.map((e) => e.element);

      const display = container.style.display;
      container.style.display = 'none';

      container.replaceChildren(...domNodes);

      requestAnimationFrame(() => {
        container.style.display = display;
        requestAnimationFrame(() => {
          container.style.willChange = 'auto';
        });
      });
    }
  }
}
