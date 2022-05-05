import { Logger } from '../Logger';

import { createParallelRun } from './parallelRun';

jest.mock('../Logger');

describe('parallelRun()', () => {
  const logger = new Logger();

  it('should retry until the promises are finally ok', async () => {
    const res = await createParallelRun(logger)([
      Promise.resolve('foo'),
      Promise.resolve('bar'),
    ]);

    expect(res).toEqual(['foo', 'bar']);
    expect(logger.debug).toHaveBeenCalledWith(
      `Running in parallel: 2 functions`
    );
    expect(logger.debug).toHaveBeenCalledWith(`Running in parallel: succesful`);
  });

  it('should retry until the callback is finally ok', async () => {
    let err: Error;
    try {
      await createParallelRun(logger)([
        Promise.resolve('foo'),
        Promise.reject(new Error('bar')),
      ]);
    } catch (e) {
      err = e as Error;
    }

    // @ts-expect-error
    expect(err).toEqual(new Error('bar'));
    expect(logger.debug).toHaveBeenCalledWith(`Running in parallel: failed`);
  });
});
