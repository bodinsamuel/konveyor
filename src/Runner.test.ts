jest.mock('./Logger');

import { Runner } from './Runner';
import { Program } from './Program';
import { Logger } from './Logger';
import { Task } from './Task';

const prgm = new Program({ logger: new Logger({ folder: './' }) });

describe('run()', () => {
  it('should run everything correctly', async () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();

    const task = new Task({
      name: 'my task',
      description: 'my description',
      before,
      exec,
      after,
    });

    const runner = new Runner(prgm, task);
    await runner.run();

    expect(before).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
  });

  it('should receive event', async () => {
    const exec = jest.fn();
    const start = jest.fn();
    const skipped = jest.fn();
    const stop = jest.fn();

    const task = new Task({
      name: 'my task',
      description: 'my description',
      exec,
    });

    const runner = new Runner(prgm, task);
    runner.once('task:start', start);
    runner.once('task:skipped', skipped);
    runner.once('task:stop', stop);
    await runner.run();

    expect(exec).toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
    expect(skipped).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('should skip correctly', async () => {
    const exec = jest.fn();
    const skipped = jest.fn();
    const stop = jest.fn();

    const task = new Task({
      name: 'my task',
      description: 'my description',
      before: () => {
        return { skip: true };
      },
      exec,
    });

    const runner = new Runner(prgm, task);
    runner.once('task:skipped', skipped);
    runner.once('task:stop', stop);
    await runner.run();

    expect(exec).not.toHaveBeenCalled();
    expect(skipped).toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });
});

describe('hooks', () => {
  it('should run before/after correctly', async () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();

    const task = new Task({
      name: 'task',
      description: 'my description',
      before,
      exec,
      after,
    });

    const runner = new Runner(prgm, task);
    await runner.run();

    expect(before).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
  });

  it('should register afterAll and run it', async () => {
    const exec = jest.fn();
    const afterAll = jest.fn();

    const task = new Task({
      name: 'task',
      description: 'my description',
      exec,
      afterAll,
    });

    const runner = new Runner(prgm, task);
    await runner.run();

    expect(exec).toHaveBeenCalled();
    expect(afterAll).not.toHaveBeenCalled();

    await runner.afterAll();
    expect(afterAll).toHaveBeenCalled();
  });
});

describe('dependencies', () => {
  it('should run deps correctly', async () => {
    const task1 = new Task({
      name: 'task1',
      description: 'my description',
    });
    const task2 = new Task({
      name: 'task2',
      description: 'my description',
      dependencies: [task1],
    });

    const start = jest.fn();
    const stop = jest.fn();

    const runner = new Runner(prgm, task2);
    runner.on('task:start', start);
    runner.on('task:stop', stop);
    await runner.run();

    expect(start).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledTimes(2);
    expect(start).toHaveBeenNthCalledWith(1, [{ task: task1 }]);
    expect(start).toHaveBeenNthCalledWith(2, [{ task: task2 }]);
  });

  it('should run 1 deps correctly and ignore it the second time', async () => {
    const task1 = new Task({
      name: 'task1',
      description: 'my description',
    });
    const task2 = new Task({
      name: 'task2',
      description: 'my description',
      dependencies: [task1],
    });
    const task3 = new Task({
      name: 'task3',
      description: 'my description',
      dependencies: [task1, task2],
    });

    const start = jest.fn();
    const stop = jest.fn();

    const runner = new Runner(prgm, task3);
    runner.on('task:start', start);
    runner.on('task:stop', stop);
    await runner.run();

    expect(start).toHaveBeenCalledTimes(3);
    expect(stop).toHaveBeenCalledTimes(3);
  });
});
