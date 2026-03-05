import type { StoreState } from 'jabroni-outfit';
import type { DataElement } from './data-manager';

export type DataFilterFnHandle<R> = (
  el: DataElement,
  state: StoreState,
  $preDefineResult?: R,
) => boolean;

export type DataFilterFnFrom<R> = Partial<DataFilterFn<R>> | DataFilterFnHandle<R>;

export type DataFilterFnRenderedResult = {
  name: string;
  condition: boolean;
};

export type DataFilterFnRendered = (v: DataElement) => DataFilterFnRenderedResult;

export class DataFilterFn<R> {
  public static prefix = 'filter-';

  public static setPrefix(name: string) {
    return `${DataFilterFn.prefix}${name}`;
  }

  constructor(
    public handle: DataFilterFnHandle<R>,
    public deps: string[] = [],
    public name: string,
    public $preDefine?: (state: StoreState) => R,
  ) {
    this.name = DataFilterFn.setPrefix(name);
  }

  public static from<R>(options: DataFilterFnFrom<R>, name: string) {
    if (typeof options === 'function') {
      const deps = [name];
      return new DataFilterFn(options, deps, name);
    }
    
    return new DataFilterFn(
      options.handle as DataFilterFnHandle<R>,
      options.deps,
      name,
      options.$preDefine,
    );
  }

  public renderFn(state: StoreState) {
    const name = this.name;

    return (): DataFilterFnRendered => {
      const preDefined = this.$preDefine?.(state);

      return (a: DataElement) => {
        const condition = this.handle(a, state, preDefined);

        return ({ condition, name });
      };
    };
  }
}
