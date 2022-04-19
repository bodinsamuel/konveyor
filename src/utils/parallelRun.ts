import type { Logger } from '../Logger';

export function createParallelRun(logger: Logger) {
  return async function parallelRun<TReturn>(
    promises: Promise<TReturn>[],
    report?: () => any,
    reportEvery: number = 1000
  ): Promise<TReturn[]> {
    const interval = setInterval(() => {
      if (report) {
        report();
      }
      logger.debug('Running in parallel: still running...');
    }, reportEvery);

    logger.debug(`Running in parallel: ${promises.length} functions`);

    try {
      const res = await Promise.all<TReturn>(promises);
      logger.debug(`Running in parallel: succesful`);
      clearInterval(interval);
      return res;
    } catch (err) {
      clearInterval(interval);
      logger.debug(`Running in parallel: failed`);
      throw err;
    }
  };
}
