export { LazyImgLoader } from './lazy-image-loader';

export class Observer {
  public observer: IntersectionObserver;
  private timeout?: number;
  constructor(private callback: (entry: Element) => void) {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }

  observe(target: Element) {
    this.observer.observe(target);
  }

  throttle(target: Element, throttleTime: number) {
    this.observer.unobserve(target);
    this.timeout = window.setTimeout(() => this.observer.observe(target), throttleTime);
  }

  handleIntersection(entries: Iterable<IntersectionObserverEntry>) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.callback(entry.target);
      }
    }
  }

  dispose() {
    if (this.timeout) clearTimeout(this.timeout);
    this.observer.disconnect();
  }

  static observeWhile(
    target: Element,
    callback: () => Promise<boolean> | boolean,
    throttleTime: number,
  ) {
    const observer = new Observer(async (target: Element) => {
      const condition = await callback();
      if (condition) {
        observer.throttle(target, throttleTime);
      } else {
        observer.dispose();
      }
    });
    observer.observe(target);
    return observer;
  }
}
