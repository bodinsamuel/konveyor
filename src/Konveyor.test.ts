jest.mock('commander');
jest.mock('./Logger');
jest.mock('./utils/exit');
jest.mock('./utils/clearConsole');
jest.mock('./utils/intro');

import { Konveyor } from './Konveyor';
import { NoTasksError, DuplicateTaskError } from './errors';
import { Task } from './Task';
import { Program } from './Program';

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

  it('should register correctly', () => {
    const task1 = new Task({
      name: 'task1',
      description: '',
    });
    const task2 = new Task({
      name: 'task2',
      description: '',
    });
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [task1, task2],
    });

    knv.registerTasks();
    expect(knv.commandsName).toEqual(['task1', 'task2']);
  });
});

describe('askForCommand()', () => {
  it('should ask for a task', async () => {
    const task1 = new Task({
      name: 'task1',
      description: '',
    });

    const program = ({
      choices: jest.fn(() => 'task1'),
    } as unknown) as Program;
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [task1],
      program,
    });

    knv.registerTasks();
    await knv.askForCommand();
    expect(program.choices).toHaveBeenCalled();
    expect(knv.pickedTask).toBe(task1);
  });
});
