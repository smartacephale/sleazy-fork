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
