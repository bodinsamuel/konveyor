import { ChildProcess } from 'child_process';
import EventEmitter from 'events';
import path from 'path';

import chalk from 'chalk';
import { Command } from 'commander';
import inquirer from 'inquirer';
import figures from 'figures';

import { Task } from './Task';
import { Store } from './Store';

import { clearConsole } from './utils/clearConsole';
import { intro } from './utils/intro';
import { Logger } from './Logger';
import { StreamTransform } from './utils/streamTransform';
import { Spinner } from './utils/spinner';
import { Program } from './Program';

interface Args {
  name: string;
  version: string;
  tasks: Task[];
  logger?: Logger;
  store?: Store<{ [k: string]: any }, string>;
  spinner?: Spinner;
}

export class Konveyor extends EventEmitter {
  // state
  private name: string;
  private version: string;
  private task?: Task;
  private tasks: Task[] = [];
  private _commandsName: string[] = [];

  // services
  readonly logger: Logger;
  private program: Program;
  private commander: Command;
  public store: Store<{}, string>;

  constructor({ name, version, logger, store, tasks }: Args) {
    super();

    this.name = name;
    this.version = version;
    this.tasks = tasks;

    this.logger =
      logger ||
      new Logger({
        folder: path.dirname(require!.main!.filename),
      });

    this.commander = new Command()
      .version(this.version)
      .usage('<command> [options]');

    this.store = store || new Store<{}, 'test'>('test', { test: {} });

    this.program = new Program({
      logger: this.logger,
    });
  }

  /**
   * Main entrypoint.
   *
   * @param argv process.argv
   */
  async start(argv: any) {
    await this.registerTasks();

    // display intro
    clearConsole();
    console.log(intro(this.name, this.version));

    this.commander.parse(argv);

    await this.askForCommand();

    if (!this.task) {
      throw new Error('No task asked, should not happen');
    }

    // run the chosen task
    try {
      await this.task.run(this.program);
    } catch (err) {
      this.program.spinner.fail();
      this.logger.error(err);
      await this.program.exit(1);
    }
  }

  private async registerTasks() {
    const commander = this.commander;

    if (this.tasks.length <= 0) {
      this.logger.error(
        'No tasks were registered, use program.tasks() to register your tasks'
      );
      await this.program.exit(1);
      return;
    }

    const names: string[] = [];
    this.tasks.forEach(task => {
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
            this.task = task;
          });
      }

      task.dependencies.forEach(dep => {
        if (typeof dep === 'undefined' || dep.name === task.name) {
          this.logger.error(
            `one dependency of "${task.name}" is undefined or the same, you probably have a circular dependency`
          );
          this.program.exit(1);
        }
      });
    });

    // Final catch all command
    commander.arguments('<command>').action(cmd => {
      commander.outputHelp();
      this.logger.error(
        `  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`)
      );
    });
  }

  private async askForCommand() {
    // @ts-ignore
    if (typeof this.task === 'undefined') {
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'Command',
          message: 'What do you want to do?',
          choices: this._commandsName,
        },
      ]);
      this.task = this.tasks.find(
        task => task.name === answers.Command
      ) as Task;
    } else {
      this.logger.log(
        `${chalk.green('?')} ${chalk.bold(
          'What do you want to do?'
        )} ${chalk.cyan(this.task.name)}`
      );
    }
  }

  //---------------- Manual Extends
  // Logger

  async streamLog(subprocess: ChildProcess, level: string = 'debug') {
    return new Promise(resolve => {
      const stream = new StreamTransform({ level });
      subprocess.stdout!.pipe(stream).pipe(this.logger.winston, {
        end: false,
      });

      subprocess.stderr!.on('data', err => {
        this.program.spinner.fail();
        throw new Error(err);
      });

      subprocess.on('close', (code: number) => {
        if (code <= 0) {
          this.program.spinner.succeed();
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
