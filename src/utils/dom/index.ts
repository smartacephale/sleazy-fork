import { sanitizeStr } from '../strings';
import { waitForElementToAppear } from './dom-observers';

export {
  waitForElementToAppear,
  waitForElementToDisappear,
  watchDomChangesWithThrottle,
  watchElementChildrenCount,
} from './dom-observers';

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

export function parseHtml(html: string): HTMLElement {
  const parsed = new DOMParser().parseFromString(html, 'text/html').body;
  if (parsed.children.length > 1) return parsed;
  return parsed.firstElementChild as HTMLElement;
}

export function copyAttributes<T extends Element = HTMLElement>(target: T, source: T) {
  for (const attr of source.attributes) {
    if (attr.nodeValue) {
      target.setAttribute(attr.nodeName, attr.nodeValue);
    }
  }
}

export function replaceElementTag(e: HTMLElement, tagName: string) {
  const newTagElement = document.createElement(tagName);
  copyAttributes(newTagElement, e);

  newTagElement.innerHTML = e.innerHTML;
  e.parentNode?.replaceChild(newTagElement, e);

  return newTagElement;
}

export function removeClassesAndDataAttributes(
  element: HTMLElement,
  keyword: string,
): void {
  Array.from(element.classList).forEach((className) => {
    if (className.includes(keyword)) {
      element.classList.remove(className);
    }
  });

  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith('data-') && attr.name.includes(keyword)) {
      element.removeAttribute(attr.name);
    }
  });
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

export function areElementsAlike<T extends HTMLElement>(
  a: T,
  b: T,
  options: { id?: boolean; className?: boolean },
) {
  if (!a || !b) return false;

  if (options.id && a.id !== b.id) return false;

  if (options.className) {
    const ca = a.className;
    const cb = b.className;
    if (!(ca.length > cb.length ? ca.includes(cb) : cb.includes(ca))) {
      return false;
    }
  }
  
  return true;
}

export function instantiateTemplate(
  sourceSelector: string,
  attributeUpdates: Record<string, string>,
  contentUpdates: Record<string, string>,
): string {
  const source = document.querySelector(sourceSelector) as HTMLElement;

  const wrapper = document.createElement('div');
  const clone = source.cloneNode(true);
  wrapper.append(clone);

  Object.entries(attributeUpdates).forEach(([attrName, attrValue]) => {
    wrapper.querySelectorAll(`[${attrName}]`).forEach((element) => {
      element.setAttribute(attrName, attrValue);
    });
  });

  Object.entries(contentUpdates).forEach(([childSelector, textValue]) => {
    wrapper.querySelectorAll<HTMLElement>(childSelector).forEach((element) => {
      element.innerText = textValue;
    });
  });

  return wrapper.innerHTML;
}

export function exterminateVideo(video: HTMLVideoElement) {
  video.removeAttribute('src');
  video.load();
  video.remove();
}

export function downloader(options: {
  append?: string;
  after?: string;
  buttonHtml: string;
  doBefore?: () => void;
}) {
  const btn = parseHtml(options.buttonHtml);

  if (options.append) document.querySelector(options.append)?.append(btn);
  if (options.after) document.querySelector(options.after)?.after(btn);

  btn?.addEventListener('click', (e) => {
    e.preventDefault();

    options.doBefore?.();

    waitForElementToAppear(document.body, 'video', (video: Element) => {
      window.location.href = video.getAttribute('src') as string;
    });
  });
}
