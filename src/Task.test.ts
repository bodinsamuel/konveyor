jest.mock('./Logger');

import { Task } from './Task';
import { Program } from './Program';
import { Logger } from './Logger';

describe('constructor', () => {
  it('should create a new instance correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
    });
    expect(task).toBeInstanceOf(Task);
    expect(task.isPrivate).toBe(false);
    expect(task.isExecuted).toBe(false);
  });

  it('should set private', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
      isPrivate: true,
    });
    expect(task.isPrivate).toBe(true);
  });
});

describe('register', () => {
  it('should register before correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
    });
    task.before(() => {});

    expect(task.hasBefore()).toBe(true);
    expect(task.hasExec()).toBe(false);
    expect(task.hasAfter()).toBe(false);
    expect(task.hasAfterAll()).toBe(false);
  });

  it('should register exec correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
    });
    task.exec(() => {});

    expect(task.hasBefore()).toBe(false);
    expect(task.hasExec()).toBe(true);
    expect(task.hasAfter()).toBe(false);
    expect(task.hasAfterAll()).toBe(false);
  });

  it('should register after correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
    });
    task.after(() => {});

    expect(task.hasBefore()).toBe(false);
    expect(task.hasExec()).toBe(false);
    expect(task.hasAfter()).toBe(true);
    expect(task.hasAfterAll()).toBe(false);
  });

  it('should register afterAll correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
    });
    task.afterAll(() => {});

    expect(task.hasBefore()).toBe(false);
    expect(task.hasExec()).toBe(false);
    expect(task.hasAfter()).toBe(false);
    expect(task.hasAfterAll()).toBe(true);
  });
});

describe('run()', () => {
  it('should run everything correctly', async () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();

    const task = new Task({
      name: 'my task',
      description: 'my description',
    });
    task.before(before);
    task.exec(exec);
    task.after(after);

    await task.run(new Program({ logger: new Logger({ folder: './' }) }));

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
    });
    task.once('task:start', start);
    task.once('task:skipped', skipped);
    task.once('task:stop', stop);
    task.exec(exec);

    await task.run(new Program({ logger: new Logger({ folder: './' }) }));

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
    });
    task.once('task:skipped', skipped);
    task.once('task:stop', stop);

    task.before(() => {
      return { skip: true };
    });
    task.exec(exec);

    await task.run(new Program({ logger: new Logger({ folder: './' }) }));

    expect(exec).not.toHaveBeenCalled();
    expect(skipped).toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });
});
