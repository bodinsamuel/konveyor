jest.mock('enquirer');
jest.mock('../Logger');
import { Logger } from '../Logger';
import { createYesNo } from './yesno';

describe('yesno()', () => {
  const logger = new Logger({ folder: '' });

  it('should ask a question and receive an answer', async () => {
    const answer = await createYesNo(logger)('foobar?');

    expect(logger.debug).toHaveBeenCalledWith(`Asking yes or no: "foobar?"`);
    expect(logger.debug).toHaveBeenCalledWith(`Got answer: "true"`);
    expect(answer).toBe(true);
  });
});
