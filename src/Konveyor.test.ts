jest.mock('commander');
jest.mock('./Logger');
jest.mock('./utils/exit');
jest.mock('./utils/clearConsole');
jest.mock('./utils/intro');
jest.mock('./utils/exit');
jest.mock('./utils/spinner');

import chalk from 'chalk';
import figures from 'figures';
import { Konveyor } from './Konveyor';
import { NoTasksError, DuplicateTaskError } from './errors';
import { Task } from './Task';
import { Program } from './Program';
import { Logger } from './Logger';
import { Spinner, exit } from './utils';

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

describe('exit()', () => {
  it('should exit(0)', async () => {
    const logger = new Logger({ folder: '/' });
    const program = ({
      spinner: new Spinner({ logger }),
      log: logger,
    } as unknown) as Program;

    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [],
      logger,
      program,
    });

    await knv.exit(0);

    expect(program.spinner.fail).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      `${chalk.magenta(figures.heart)} my script done.`
    );
    expect(logger.debug).toHaveBeenCalledWith(`---- Konveyor Exit (0)`);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('should exit(1)', async () => {
    const logger = new Logger({ folder: '/' });
    const program = ({
      spinner: new Spinner({ logger }),
      log: logger,
    } as unknown) as Program;

    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      tasks: [],
      logger,
      program,
    });

    await knv.exit(1);

    expect(program.spinner.fail).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      `${chalk.red(
        figures.squareSmallFilled
      )} Failed. Check "debug.log" to know more`
    );
    expect(logger.debug).toHaveBeenCalledWith(`---- Konveyor Exit (1)`);
    expect(exit).toHaveBeenCalledWith(1);
  });
});
