export function circularShift(n: number, c = 6, s = 1): number {
  return (n + s) % c || c;
}
