import { parseHtml, waitForElementToAppear } from '.';

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
