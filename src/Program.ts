import { ChildProcess } from 'child_process';
import EventEmitter from 'events';

import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import { Logger } from 'winston';

import { Task } from './Task';
import { Storage } from './Storage';

import { clearConsole } from './utils/clearConsole';
import { intro } from './utils/intro';
import { logger as defaultLogger } from './utils/logger';
import { StreamTransform } from './utils/streamTransform';
import { Spinner } from './utils/spinner';

interface Args {
  name: string;
  version: string;
  logger?: Logger;
  storage?: Storage;
  spinner?: Spinner;
}

export class Program extends EventEmitter {
  // state
  private name: string;
  private version: string;
  private started: boolean = false;
  private _tasks: Task[] = [];

  // services
  readonly logger: Logger;
  readonly spinner: Spinner;
  private commander: Command;
  private storage: Storage;

  constructor({ name, version, logger, storage, spinner }: Args) {
    super();

    this.name = name;
    this.version = version;

    this.logger = logger || defaultLogger;
    this.spinner = spinner || new Spinner();

    this.commander = new Command()
      .version(this.version)
      .usage('<command> [options]');

    this.storage = storage || new Storage();
  }

  tasks(...tasks: Task[]): this {
    if (this.started) {
      throw new Error('can not call this method after start() has been called');
    }
    this._tasks = tasks;
    return this;
  }

  async start(argv: any) {
    this.started = true;
    const commander = this.commander;
    const commands: string[] = [];

    let taskRequested: Task | null = null;

    this._tasks.forEach(task => {
      if (task.isPrivate === false) {
        commands.push(task.name);
        commander
          .command(task.name)
          .description(task.description)
          .action(() => {
            taskRequested = task;
          });
      }

      task._dependencies.forEach(dep => {
        if (typeof dep === 'undefined' || dep.name === task.name) {
          this.error(
            `one dependency of "${task.name}" is undefined or the same, you probably have a circular dependency`
          );
          this.exit();
        }
      });
    });

    clearConsole();

    console.log(intro(this.name, this.version));

    if (this._tasks.length <= 0) {
      this.error(
        'No tasks were registered, use program.tasks() to register your tasks'
      );
      this.exit();
      return;
    }

    commander.arguments('<command>').action(cmd => {
      commander.outputHelp();
      this.error(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
    });

    commander.parse(argv);

    if (!taskRequested) {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'Command',
          message: 'What do you want to do?',
          choices: commands,
        },
      ]);
      taskRequested = this._tasks.find(
        task => task.name === answers.Command
      ) as Task;
    }

    try {
      // @ts-ignore
      await taskRequested.run(this);
    } catch (err) {
      this.error(err.toString());
    }
  }

  exit() {
    process.exit(1);
  }

  //---------------- Manual Extends
  // Logger
  log(msg: string) {
    this.logger.log('info', msg);
  }
  error(msg: string) {
    this.spinner.stop(true);
    this.logger.error(msg);
  }
  debug(msg: string) {
    this.logger.debug(msg);
  }
  async streamLog(process: ChildProcess, level: string = 'debug') {
    return new Promise(resolve => {
      const stream = new StreamTransform({ level });
      process.stdout!.pipe(stream).pipe(this.logger);

      process.stderr!.on('data', err => {
        this.spinner.fail();
        throw new Error(err);
      });

      process.on('close', (code: number) => {
        if (code <= 0) {
          this.spinner.stop(true);
          resolve();
        }
      });
    });
  }

  // Storage
  get(key: string) {
    return this.storage.get(key);
  }
  set(key: string, value: any) {
    return this.storage.set(key, value);
  }
}
