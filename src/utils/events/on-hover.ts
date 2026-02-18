export class OnHover {
  private handleLeaveEvent() {
    this.onLeave?.(this.target as HTMLElement);
    this.onOverFinally?.();
    this.target = undefined;
    this.onOverFinally = undefined;
    this.leaveSubject = undefined;
  }

  private handleEvent(e: PointerEvent) {
    const currentTarget = e.target as HTMLElement;
    if (!this.subjectSelector(currentTarget) || this.target === currentTarget) return;
    this.leaveSubject?.dispatchEvent(new PointerEvent('pointerleave'));

    this.target = currentTarget;
    const result = this.onOver(this.target);
    this.onOverFinally = result?.onOverCallback;
    this.leaveSubject = result?.leaveTarget || this.target;
    this.leaveSubject.addEventListener('pointerleave', (_) => this.handleLeaveEvent(), {
      once: true,
    });
  }

  private target: HTMLElement | undefined;
  private leaveSubject: HTMLElement | undefined;
  private onOverFinally: (() => void) | undefined;

  constructor(
    private container: HTMLElement,
    private subjectSelector: (target: HTMLElement) => boolean,
    private onOver: (
      target: HTMLElement,
    ) => void | { onOverCallback?: () => void; leaveTarget?: HTMLElement },
    private onLeave?: (target: HTMLElement) => void,
  ) {
    this.container.addEventListener('pointerover', (e) => this.handleEvent(e));
  }

  static create(...args: ConstructorParameters<typeof OnHover>) {
    return new OnHover(...args);
  }
}
