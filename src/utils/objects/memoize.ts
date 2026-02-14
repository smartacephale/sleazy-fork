import type { AnyFunction } from '../../types';

export interface MemoizedFunction<T extends AnyFunction> extends CallableFunction {
  (...args: Parameters<T>): ReturnType<T>;
  clear: () => void;
}

export function memoize<T extends AnyFunction>(fn: T): MemoizedFunction<T> {
  const cache = new Map<string, ReturnType<T>>();

  const memoizedFunction = ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as MemoizedFunction<T>;

  return memoizedFunction;
}
