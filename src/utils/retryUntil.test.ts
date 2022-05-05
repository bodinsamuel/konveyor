import { Logger } from '../Logger';

import { createRetryUntil } from './retryUntil';

jest.mock('../Logger');

describe('retryUntil()', () => {
  const logger = new Logger();

  it('should retry until the callback is finally ok', async () => {
    let iter = 0;
    await createRetryUntil(logger)(() => {
      iter += 1;
      return iter >= 3;
    }, 100);

    expect(iter).toBe(3);
    expect(logger.debug).toHaveBeenCalledWith(
      `Trying callback until resolution...`
    );
    expect(logger.debug).toHaveBeenCalledWith(
      `Callback failed for this time, retrying in 100ms.`
    );
  });
});
