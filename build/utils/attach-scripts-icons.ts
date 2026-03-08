import type { MonkeyUserScript } from 'vite-plugin-monkey';

export function setIcon(meta: MonkeyUserScript) {
  if ('icon' in meta) return;
  if (!meta.match) return;

  const url: string =
    Array.isArray(meta.match) && typeof meta.match[0] === 'string'
      ? meta.match[0]
      : typeof meta.match === 'string'
        ? meta.match
        : '';

  const res = url.match(/([^./?#]+\.[a-z0-9]+)(?:[/?#]|$)/i);

  if (res?.[1]) {
    const icon = `https://www.google.com/s2/favicons?sz=64&domain=${res[1]}`;
    Object.assign(meta, { icon });
  }
}
