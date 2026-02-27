export { formatTimeToHHMMSS, timeToSeconds } from './time-parser';

export function parseUrl(s: HTMLAnchorElement | Location | URL | string): URL {
  return new URL(typeof s === 'string' ? s : s.href);
}

export function parseIntegerOr(n: string | number, or: number): number {
  const num = Number(n);
  return Number.isSafeInteger(num) ? num : or;
}

export function parseNumberWithLetter(str: string): number {
  const multipliers = { k: 1e3, m: 1e6 } as const;
  const match = str.trim().match(/^([\d.]+)(\w)?$/);

  if (!match) return 0;

  const num = parseFloat(match[1]);
  const suffix = match[2]?.toLowerCase() as keyof typeof multipliers;

  if (suffix && suffix in multipliers) {
    return num * multipliers[suffix];
  }

  return num;
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
