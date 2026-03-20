import { sanitizeStr } from '../strings';

export function querySelectorOrSelf<T extends Element = HTMLElement>(
  element: T,
  selector: string,
): T | null {
  if (element.matches?.(selector)) {
    return element as T;
  }
  return element.querySelector<T>(selector);
}

export function querySelectorLast<T extends Element = HTMLElement>(
  root: ParentNode = document,
  selector: string,
): T | undefined {
  const nodes = root.querySelectorAll<T>(selector);
  if (nodes.length < 1) {
    return querySelectorOrSelf<T>(root as T, selector) || undefined;
  }
  return nodes[nodes.length - 1];
}

export function querySelectorLastNumber(selector: string, e: ParentNode = document) {
  const text = querySelectorText(e, selector);
  return Number(text.match(/\d+/g)?.pop() || 0);
}

export function querySelectorText(e: ParentNode, selector?: string): string {
  if (typeof selector !== 'string') return '';
  const text = querySelectorOrSelf(e as HTMLElement, selector)?.innerText || '';
  return sanitizeStr(text);
}

export function getCommonParents<T extends HTMLElement>(
  elements: Iterable<T>,
): HTMLElement[] {
  return Map.groupBy(elements, (e) => e.parentElement)
    .keys()
    .filter((e) => e !== null)
    .toArray();
}

export function findNextSibling<T extends Element = HTMLElement>(e: T) {
  if (e.nextElementSibling) return e.nextElementSibling;
  if (e.parentElement) return findNextSibling(e.parentElement);
  return null;
}
