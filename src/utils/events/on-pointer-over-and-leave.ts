export function onPointerOverAndLeave(
  container: HTMLElement,
  subjectSelector: (target: HTMLElement) => boolean,
  onOver: (
    target: HTMLElement,
  ) => { onOverCallback?: () => void; leaveTarget?: HTMLElement } | void,
  onLeave?: (target: HTMLElement) => void,
) {
  let target: HTMLElement | undefined;
  let onOverFinally: (() => void) | undefined;

  function handleLeaveEvent() {
    onLeave?.(target as HTMLElement);
    onOverFinally?.();
    target = undefined;
  }

  function handleEvent(e: PointerEvent) {
    const currentTarget = e.target as HTMLElement;
    if (!subjectSelector(currentTarget) || target === currentTarget) return;
    target = currentTarget;

    const result = onOver(target);

    onOverFinally = result?.onOverCallback;
    const leaveSubject = result?.leaveTarget || target;

    leaveSubject.addEventListener('pointerleave', handleLeaveEvent, {
      once: true,
    });
  }

  container.addEventListener('pointerover', handleEvent);
}

