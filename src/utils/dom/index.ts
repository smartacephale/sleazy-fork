export * from './attributes';
export * from './miscellaneous';
export * from './observers';
export * from './selectors';

export function parseHtml(html: string): HTMLElement {
  return parseDocumentBody(html);
}

export function parseDocument(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

export function getDocumentBody(document: Document): HTMLBodyElement {
  const parsed = document.body as HTMLBodyElement;
  if (parsed.children.length > 1) return parsed as HTMLBodyElement;
  return parsed.firstElementChild as HTMLBodyElement;
}

export function parseDocumentBody(html: string): HTMLBodyElement {
  return getDocumentBody(parseDocument(html));
}
