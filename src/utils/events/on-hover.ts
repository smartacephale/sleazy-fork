export class OnHover {
  private handleLeave() {
    this.onOverCallback?.();
    this.onOverCallback = undefined;
    this.target = undefined;
  }

  private handleHover(e: PointerEvent) {
    const newTarget = (e.target as HTMLElement).closest<HTMLElement>(this.targetSelector);
    if (!newTarget || this.target === newTarget) return;

    this.target?.dispatchEvent(new PointerEvent('pointerleave'));
    this.target = newTarget;

    this.onOverCallback = this.onOver(this.target) as undefined | (() => void);

    this.target.addEventListener('pointerleave', () => this.handleLeave(), { once: true });
  }

  private target?: HTMLElement;
  private onOverCallback?: () => void;

  constructor(
    private container: HTMLElement,
    private targetSelector: string,
    private onOver: (target: HTMLElement) => void | (() => void),
  ) {
    this.container.addEventListener('pointerover', (e) => this.handleHover(e));
  }

  static create(...args: ConstructorParameters<typeof OnHover>) {
    return new OnHover(...args);
  }
}
