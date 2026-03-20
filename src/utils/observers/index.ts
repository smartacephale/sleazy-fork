export { LazyImgLoader } from './lazy-image-loader';

export class Observer<T extends Element = HTMLElement> {
  private timeout?: number;
  private observer: IntersectionObserver;

  constructor(private callback: (entry: T) => void) {
    this.observer = new IntersectionObserver(this.handleIntersection.bind(this));
  }

  public observe(target: T) {
    this.observer.observe(target);
  }

  public unobserve(target: T) {
    this.observer.unobserve(target);
  }

  private throttle(target: T, throttleTime: number) {
    this.unobserve(target);
    this.timeout = window.setTimeout(() => this.observer.observe(target), throttleTime);
  }

  private handleIntersection(entries: Iterable<IntersectionObserverEntry>) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.callback(entry.target as T);
      }
    }
  }

  public dispose() {
    if (this.timeout) clearTimeout(this.timeout);
    this.observer.disconnect();
  }

  public static observeWhile<T extends Element = HTMLElement>(
    target: T,
    callback: () => Promise<boolean> | boolean,
    throttleTime: number,
  ) {
    const observer = new Observer(async (target: T) => {
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
