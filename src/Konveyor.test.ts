jest.mock('commander');
jest.mock('./Logger');
jest.mock('./utils/exit');
jest.mock('./utils/clearConsole');
jest.mock('./utils/intro');

import { Konveyor } from './Konveyor';
import { NoTasksError, DuplicateTaskError } from './errors';
import { Task } from './Task';

describe('constructor', () => {
  it('should create a new instance correctly', () => {
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [],
    });
    expect(knv).toBeInstanceOf(Konveyor);
  });
});

describe('registerTasks()', () => {
  it('should throw correctly when no tasks', () => {
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [],
    });

    expect(() => {
      knv.registerTasks();
    }).toThrowError(new NoTasksError());
  });

  it('should throw correctly when duplicate tasks', () => {
    const task = new Task({
      name: 'task',
      description: '',
    });
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [task, task],
    });

    expect(() => {
      knv.registerTasks();
    }).toThrowError(new DuplicateTaskError('task'));
  });
});
