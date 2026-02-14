export function waitForElementToAppear(
  parent: ParentNode,
  selector: string,
  callback: (el: Element) => void,
) {
  const observer = new MutationObserver((_mutations) => {
    const el = parent.querySelector(selector);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

export function waitForElementToDisappear(observable: HTMLElement, callback: () => void) {
  const observer = new MutationObserver((_mutations) => {
    if (!observable.isConnected) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
  return observer;
}

export function watchElementChildrenCount(
  element: ParentNode,
  callback: (observer: MutationObserver, count: number) => void,
) {
  let count = element.children.length;
  const observer = new MutationObserver((mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        if (count !== element.children.length) {
          count = element.children.length;
          callback(observer, count);
        }
      }
    }
  });

  observer.observe(element, { childList: true });
  return observer;
}

export function watchDomChangesWithThrottle(
  element: HTMLElement,
  callback: () => void,
  throttle = 1000,
  times = Infinity,
  options: MutationObserverInit = { childList: true, subtree: true, attributes: true },
) {
  let lastMutationTime: number;
  let timeout: number;
  let times_ = times;
  const observer = new MutationObserver((_mutationList, _observer) => {
    if (times_ !== Infinity && times_ < 1) {
      observer.disconnect();
      return;
    }
    times_--;
    const now = Date.now();
    if (lastMutationTime && now - lastMutationTime < throttle) {
      timeout && clearTimeout(timeout);
    }
    timeout = window.setTimeout(callback, throttle);
    lastMutationTime = now;
  });

  observer.observe(element, options);
  return observer;
}
