import { Logger } from '../Logger';

import { createChoices } from './choices';

jest.mock('enquirer');
jest.mock('../Logger');

describe('choices()', () => {
  const logger = new Logger();
  it('should ask a question and receive a single answer', async () => {
    const answer = await createChoices(logger)('foobar?', [
      { name: 'foo' },
      { name: 'bar' },
    ]);

    expect(logger.debug).toHaveBeenCalledWith(`Asking question: "foobar?"`);
    expect(logger.debug).toHaveBeenCalledWith(`Got answer: "foo"`);
    expect(answer).toBe('foo');
  });
});
