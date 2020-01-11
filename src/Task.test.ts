jest.mock('./Logger');

import { Task } from './Task';

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
      before: () => {},
    });

    expect(task.hasBefore()).toBe(true);
    expect(task.hasExec()).toBe(false);
    expect(task.hasAfter()).toBe(false);
    expect(task.hasAfterAll()).toBe(false);
  });

  it('should register exec correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
      exec: () => {},
    });

    expect(task.hasBefore()).toBe(false);
    expect(task.hasExec()).toBe(true);
    expect(task.hasAfter()).toBe(false);
    expect(task.hasAfterAll()).toBe(false);
  });

  it('should register after correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
      after: () => {},
    });

    expect(task.hasBefore()).toBe(false);
    expect(task.hasExec()).toBe(false);
    expect(task.hasAfter()).toBe(true);
    expect(task.hasAfterAll()).toBe(false);
  });

  it('should register afterAll correctly', () => {
    const task = new Task({
      name: 'my task',
      description: 'my description',
      afterAll: () => {},
    });

    expect(task.hasBefore()).toBe(false);
    expect(task.hasExec()).toBe(false);
    expect(task.hasAfter()).toBe(false);
    expect(task.hasAfterAll()).toBe(true);
  });

  it('should get all method correctly', () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();
    const afterAll = jest.fn();

    const task = new Task({
      name: 'my task',
      description: 'my description',
      before,
      exec,
      after,
      afterAll,
    });

    expect(task.before).toBe(before);
    expect(task.exec).toBe(exec);
    expect(task.after).toBe(after);
    expect(task.afterAll).toBe(afterAll);
  });
});

describe('dependencies', () => {
  it('should register deps correctly', () => {
    const task1 = new Task({
      name: 'my task',
      description: 'my description',
    });
    const task2 = new Task({
      name: 'my task',
      description: 'my description',
      dependencies: [task1],
    });
    expect(task1.dependencies).toEqual(new Set());
    expect(task2.dependencies).toEqual(new Set([task1]));
  });
});
