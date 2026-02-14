export type AnyFunction = (...args: any[]) => any;

export type NonFunctionKeys<T> = {
  [K in keyof T]: T[K] extends AnyFunction ? never : K;
}[keyof T];

export type NonFunctionProperties<T> = Pick<T, NonFunctionKeys<T>>;
