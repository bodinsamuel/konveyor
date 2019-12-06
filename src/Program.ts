import EventEmitter from 'events';

import { Logger } from 'winston';
import { Command } from 'commander';
import inquirer from 'inquirer';

import { Task } from './Task';
import { Storage } from './Storage';

import { clearConsole } from './utils/clearConsole';
import { intro } from './utils/intro';
import { logger as defaultLogger } from './utils/logger';
import chalk from 'chalk';

interface Args {
  name: string;
  version: string;
  logger?: Logger;
  storage?: Storage;
}

export class Program extends EventEmitter {
  private name: string;
  private version: string;

  private logger: Logger;

  private commander: Command;
  private storage: Storage;

  private _tasks: Task[] = [];

  private started: boolean = false;

  constructor({ name, version, logger, storage }: Args) {
    super();

    this.name = name;
    this.version = version;

    this.logger = logger || defaultLogger;

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
      if (task.global) {
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

    this.log(intro(this.name, this.version));

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
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'Command',
            message: 'What do you want to do?',
            choices: commands,
          },
        ])
        .then(answers => {
          console.log('\nOrder receipt:');
          console.log(JSON.stringify(answers, null, '  '));
        });

      return;
    }

    try {
      // @ts-ignore
      await taskRequested.run(this);
    } catch (err) {
      console.error(err);
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
    this.logger.error(msg);
  }
  debug(msg: string) {
    this.logger.debug(msg);
  }

  // Storage
  get(key: string) {
    return this.storage.get(key);
  }
  set(key: string, value: any) {
    return this.storage.set(key, value);
  }
}
