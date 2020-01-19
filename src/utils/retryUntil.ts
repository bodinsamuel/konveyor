import { Logger } from '../Logger';

export function createRetryUntil(logger: Logger) {
  return function retryUntil(
    callback: () => Promise<boolean> | boolean,
    interval: number = 2000
  ): Promise<void> {
    logger.debug(`Trying callback until resolution...`);

    return new Promise(resolve => {
      const ref = setInterval(async () => {
        const ret = await callback();

        if (ret) {
          clearInterval(ref);
          logger.debug(`Callback resolved.`);
          resolve();
        }

        logger.debug(
          `Callback failed for this time, retrying in ${interval}ms.`
        );
      }, interval);
    });
  };
}
