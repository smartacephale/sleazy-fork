import { parseHtml } from '../dom';

export const MOBILE_UA = {
  'User-Agent': [
    'Mozilla/5.0 (Linux; Android 10; K)',
    'AppleWebKit/537.36 (KHTML, like Gecko)',
    'Chrome/114.0.0.0 Mobile Safari/537.36',
  ].join(' '),
} as const;

export async function fetchWith<T extends JSON | string | HTMLElement>(
  input: RequestInfo | URL,
  options: {
    init?: RequestInit;
    type: 'json' | 'html' | 'text';
    mobile?: boolean;
  },
): Promise<T> {
  const requestInit: RequestInit = options.init || {};

  if (options.mobile) {
    Object.assign(requestInit, { headers: new Headers(MOBILE_UA) });
  }

  const r = await fetch(input, requestInit).then((r) => r);

  if (options.type === 'json') return (await r.json()) as T;
  if (options.type === 'html') return parseHtml(await r.text()) as T;
  return (await r.text()) as T;
}

export const fetchJson = (input: RequestInfo | URL) =>
  fetchWith<JSON>(input, { type: 'json' });
export const fetchHtml = (input: RequestInfo | URL) =>
  fetchWith<HTMLElement>(input, { type: 'html' });
export const fetchText = (input: RequestInfo | URL) =>
  fetchWith<string>(input, { type: 'text' });
