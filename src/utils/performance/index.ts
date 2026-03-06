export function runIdleJob<T>(iterator: Iterator<T>, job: (v: T) => void) {
  return new Promise((resolve) => {
    const scheduler =
      window.requestIdleCallback ||
      ((cb: (d: IdleDeadline) => void) => {
        return setTimeout(() => {
          cb({
            didTimeout: true,
            timeRemaining: () => 50,
          });
        }, 1);
      });

    function runBatch(deadline: IdleDeadline) {
      while (deadline.timeRemaining() > 0) {
        const { value, done } = iterator.next();

        if (done) {
          resolve(true);
          return;
        }

        job(value);
      }

      scheduler(runBatch);
    }

    scheduler(runBatch);
  });
}

export function containMutation(container: HTMLElement, callback: () => void) {
  container.style.contain = 'content';
  try {
    callback();
  } finally {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.style.contain = 'none';
      });
    });
  }
}
