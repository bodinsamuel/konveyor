import type { Ora } from 'ora';

import type { Logger } from '../Logger';

import { Spinner } from './spinner';

describe('spinner', () => {
  let instance: Spinner;
  const logger = {
    debug: jest.fn(),
  } as unknown as Logger;
  const ora = {
    spin: jest.fn(),
    start: jest.fn(),
    succeed: jest.fn(),
    info: jest.fn(),
    fail: jest.fn(),
    stop: jest.fn(),
    stopAndPersist: jest.fn(),
  } as unknown as Ora;

  it('should create an instance', () => {
    instance = new Spinner({ logger, ora });
    expect(instance).toBeInstanceOf(Spinner);
  });

  it('should start the spinner', () => {
    instance.spin('hello');
    expect(ora.start).toHaveBeenCalledWith('hello');
    expect(logger.debug).toHaveBeenCalledWith('[Spinner] start: hello');
  });

  it('should stop the spinner', () => {
    jest.resetAllMocks();

    instance.stop();
    expect(ora.stopAndPersist).toHaveBeenCalledWith();
    expect(logger.debug).toHaveBeenCalledWith('[Spinner] stop');
  });

  it('should succeed the spinner', () => {
    jest.resetAllMocks();

    instance.spin('checking...');
    instance.succeed('done');
    expect(ora.succeed).toHaveBeenCalledWith('done');
    expect(logger.debug).toHaveBeenNthCalledWith(
      1,
      '[Spinner] start: checking...'
    );
    expect(logger.debug).toHaveBeenNthCalledWith(2, '[Spinner] succeed: done');
  });

  it('should fail the spinner', () => {
    jest.resetAllMocks();

    instance.spin('checking...');
    instance.fail('oops');
    expect(ora.fail).toHaveBeenCalledWith('oops');
    expect(logger.debug).toHaveBeenNthCalledWith(
      1,
      '[Spinner] start: checking...'
    );
    expect(logger.debug).toHaveBeenNthCalledWith(2, '[Spinner] fail: oops');
  });

  it('should info the spinner', () => {
    jest.resetAllMocks();

    instance.spin('checking...');
    instance.info('fyi');
    expect(ora.info).toHaveBeenCalledWith('fyi');
    expect(logger.debug).toHaveBeenNthCalledWith(
      1,
      '[Spinner] start: checking...'
    );
    expect(logger.debug).toHaveBeenNthCalledWith(2, '[Spinner] info: fyi');
  });
});
