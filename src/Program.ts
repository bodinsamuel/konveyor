import { ChildProcess } from 'child_process';
import EventEmitter from 'events';

import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import figures from 'figures';
import { Logger } from 'winston';

import { Task } from './Task';
import { Store, StoreGeneric } from './Store';

import { clearConsole } from './utils/clearConsole';
import { intro } from './utils/intro';
import { logger as defaultLogger } from './utils/logger';
import { StreamTransform } from './utils/streamTransform';
import { Spinner } from './utils/spinner';

interface Args {
  name: string;
  version: string;
  logger?: Logger;
  store?: Store<{ [k: string]: any }, string>;
  spinner?: Spinner;
}

export class Program extends EventEmitter {
  // state
  private name: string;
  private version: string;
  private started: boolean = false;
  private _task?: Task;
  private _tasks: Task[] = [];
  private _commandsName: string[] = [];

  // services
  readonly logger: Logger;
  readonly spinner: Spinner;
  private commander: Command;
  public store: Store<{}, string>;

  constructor({ name, version, logger, store, spinner }: Args) {
    super();

    this.name = name;
    this.version = version;

    this.logger = logger || defaultLogger;
    this.spinner = spinner || new Spinner();

    this.commander = new Command()
      .version(this.version)
      .usage('<command> [options]');

    this.store = store || new Store<{}, 'test'>('test', { test: {} });
  }

  tasks(...tasks: Task[]): this {
    if (this.started) {
      throw new Error('can not call this method after start() has been called');
    }
    this._tasks = tasks;
    return this;
  }

  /**
   * Main entrypoint.
   *
   * @param argv process.argv
   */
  async start(argv: any) {
    this.started = true;

    await this.registerTasks();

    // display intro
    clearConsole();
    console.log(intro(this.name, this.version));

    this.commander.parse(argv);

    await this.askForCommand();

    if (!this._task) {
      throw new Error('No task asked, should not happen');
    }

    // run the chosen task
    try {
      await this._task.run(this);
    } catch (err) {
      this.error(err.toString());
      await this.exit(1);
    }

    this.started = false;
  }

  async exit(code: number = 1) {
    this.spinner.stop();
    await new Promise(resolve => {
      this.logger.on('finish', () => {
        resolve();
      });
      this.logger.end();
    });

    process.exit(code);
  }

  private async registerTasks() {
    const commander = this.commander;

    if (this._tasks.length <= 0) {
      this.error(
        'No tasks were registered, use program.tasks() to register your tasks'
      );
      await this.exit(1);
      return;
    }

    const names: string[] = [];
    this._tasks.forEach(task => {
      if (names.includes(task.name)) {
        throw new Error(`Task "${task.name}" is already registered`);
      }
      names.push(task.name);

      if (task.isPrivate === false) {
        this._commandsName.push(task.name);
        commander
          .command(task.name)
          .description(task.description)
          .action(() => {
            this._task = task;
          });
      }

      task.dependencies.forEach(dep => {
        if (typeof dep === 'undefined' || dep.name === task.name) {
          this.error(
            `one dependency of "${task.name}" is undefined or the same, you probably have a circular dependency`
          );
          this.exit(1);
        }
      });
    });

    // Final catch all command
    commander.arguments('<command>').action(cmd => {
      commander.outputHelp();
      this.error(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
    });
  }

  private async askForCommand() {
    // @ts-ignore
    if (typeof this._task === 'undefined') {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'Command',
          message: 'What do you want to do?',
          choices: this._commandsName,
        },
      ]);
      this._task = this._tasks.find(
        task => task.name === answers.Command
      ) as Task;
    } else {
      this.log(
        `${chalk.green('?')} ${chalk.bold(
          'What do you want to do?'
        )} ${chalk.cyan(this._task.name)}`
      );
    }
  }

  //---------------- Manual Extends
  // Logger
  log(msg: string) {
    this.logger.log('info', msg);
  }
  error(msg: string) {
    this.spinner.stop();

    this.logger.error(msg);
  }
  warn(msg: string) {
    this.logger.warn(msg);
  }
  debug(msg: string) {
    this.logger.debug(msg);
  }
  help(msg: string, command?: string) {
    this.log('\r');

    this.log(
      `${chalk.blue(figures.info)} ${msg} ${command && chalk.dim(command)}`
    );
    this.log('\r');
  }
  async streamLog(subprocess: ChildProcess, level: string = 'debug') {
    return new Promise(resolve => {
      const stream = new StreamTransform({ level });
      subprocess.stdout!.pipe(stream).pipe(this.logger, {
        end: false,
      });

      subprocess.stderr!.on('data', err => {
        this.spinner.fail();
        throw new Error(err);
      });

      subprocess.on('close', (code: number) => {
        if (code <= 0) {
          this.spinner.succeed();
          resolve();
        }
      });
    });
  }

  // Storage
  // get(key: any) {
  //   return this.store.get(key);
  // }
  // set(key: any, value: any) {
  //   return this.store.set(key, value);
  // }
}
