jest.mock('inquirer');
jest.mock('../Logger');
import { createChoices } from './choices';
import { Logger } from '../Logger';

describe('choices()', () => {
  const logger = new Logger({ folder: '' });
  it('should ask a question and receive a single answer', async () => {
    const answer = await createChoices(logger)('foobar?', ['yes', 'no']);

    expect(logger.debug).toHaveBeenCalledWith(`Asking question: "foobar?"`);
    expect(logger.debug).toHaveBeenCalledWith(`Got answer: "yes"`);
    expect(answer).toBe('yes');
  });
});
