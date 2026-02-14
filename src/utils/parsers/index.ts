export { formatTimeToHHMMSS, timeToSeconds } from './time-parser';

export function parseIntegerOr(n: string | number, or: number): number {
  const num = Number(n);
  return Number.isSafeInteger(num) ? num : or;
}

// "data:02;body+head:async;void:;zero:;"
export function parseDataParams(str: string): Record<string, string> {
  const paramsStr = decodeURI(str.trim()).split(';');
  return paramsStr.reduce(
    (acc, s) => {
      const parsed = s.match(/([+\w]+):([\w\- ]+)?/);
      if (parsed) {
        const [, key, value] = parsed;
        if (value) {
          key.split('+').forEach((p) => {
            acc[p] = value;
          });
        }
      }
      return acc;
    },
    {} as Record<string, string>,
  );
}

export function parseCssUrl(s: string) {
  return s.replace(/url\("|"\).*/g, '');
}
