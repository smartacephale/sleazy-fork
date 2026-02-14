export function chunks<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

export function* irange(start: number = 1, step: number = 1) {
  for (let i = start; ; i += step) {
    yield i;
  }
}

export function range(size: number, start: number = 1, step: number = 1): number[] {
  return irange(start, step).take(size).toArray();
}
