export * from './attributes';
export * from './miscellaneous';
export * from './observers';
export * from './selectors';

export function parseHtml(html: string): HTMLElement {
  const parsed = new DOMParser().parseFromString(html, 'text/html').body;
  if (parsed.children.length > 1) return parsed;
  return parsed.firstElementChild as HTMLElement;
}
