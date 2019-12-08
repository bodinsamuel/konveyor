export function tryUntil(
  callback: () => Promise<boolean> | boolean,
  interval: number = 2000
): Promise<void> {
  return new Promise(resolve => {
    const ref = setInterval(async () => {
      const ret = await callback();
      if (ret) {
        clearInterval(ref);
        resolve();
        return;
      }
    }, interval);
  });
}
