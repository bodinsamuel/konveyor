jest.mock('../Logger');
import { Logger } from '../Logger';
import { createParallelRun } from './parallelRun';

describe('parallelRun()', () => {
  const logger = new Logger({ folder: '' });

  it('should retry until the callback is finally ok', async () => {
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
});
