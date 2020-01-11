import path from 'path';

import chalk from 'chalk';
import { Command } from 'commander';
import figures from 'figures';

import { Task } from './Task';
import { Logger } from './Logger';
import { Program } from './Program';
import { intro, clearConsole, Spinner } from './utils/';
import { Event } from './Event';
import { Runner } from './Runner';
import { DuplicateTaskError, NoTasksError, ExitError } from './errors';

interface Args {
  name: string;
  version: string;
  tasks: Task[];
  logger?: Logger;
  spinner?: Spinner;
  command?: Command;
}

export class Konveyor extends Event<'konveyor:start'> {
  // state
  private name: string;
  private version: string;
  private task?: Task;
  private tasks: Task[] = [];
  private _commandsName: string[] = [];

  // services
  public readonly logger: Logger;
  private program: Program;
  private commander: Command;
  private runner?: Runner;

  public constructor({ name, version, logger, tasks, command }: Args) {
    super();

    this.name = name;
    this.version = version;
    this.tasks = tasks;

    this.logger =
      logger ||
      new Logger({
        folder: path.dirname(require!.main!.filename),
      });

    this.commander =
      command ||
      new Command().version(this.version).usage('<command> [options]');

    this.program = new Program({
      logger: this.logger,
    });
  }

  /**
   * Main entrypoint.
   *
   * @param argv - process.argv
   */
  public async start(argv: any) {
    this.logger.debug(`---- Konveyor Start [${new Date().toISOString()}]`);
    this.emit('konveyor:start');

    try {
      this.registerTasks();
    } catch (err) {
      this.logger.error(err);
      await this.exit(1);
    }

    // display intro
    clearConsole();
    // eslint-disable-next-line no-console
    console.log(intro(this.name, this.version));

    this.commander.parse(argv);

    await this.askForCommand();

    if (!this.task) {
      throw new Error('No task asked, should not happen');
    }

    // run the chosen task
    try {
      this.runner = new Runner(this.program, this.task);
      await this.runner.run();
    } catch (err) {
      if (err instanceof ExitError) {
        this.logger.error(err);
      }
      await this.exit(1);
    }

    this.logger.info(`${figures.heart} ${this.name} done.`);
    await this.exit(0);
  }

  private registerTasks() {
    const commander = this.commander;

    if (this.tasks.length <= 0) {
      throw new NoTasksError();
    }

    const names: string[] = [];
    this.tasks.forEach(task => {
      if (names.includes(task.name)) {
        throw new DuplicateTaskError(task.name);
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
          throw new Error(
            `one dependency of "${task.name}" is undefined or the same, you probably have a circular dependency`
          );
        }
      });
    });

    this.logger.debug(`Registered ${this.tasks.length} tasks`);

    // Final catch all command
    commander.arguments('<command>').action(cmd => {
      commander.outputHelp();
      this.logger.error(
        `  ${chalk.red(`Unknown command ${chalk.yellow(cmd)}.`)}`
      );
    });
  }

  private async askForCommand() {
    // @ts-ignore
    if (typeof this.task === 'undefined') {
      const answer = await this.program.choices(
        'What do you want to do?',
        this._commandsName
      );
      this.task = this.tasks.find(task => task.name === answer) as Task;
    } else {
      this.logger.info(
        `${chalk.green('?')} ${chalk.bold(
          'What do you want to do?'
        )} ${chalk.cyan(this.task.name)}`
      );
    }
  }

  public async exit(code: number) {
    const prgm = this.program;
    prgm.spinner.fail();

    this.runner!.afterAll();

    this.logger.info(`${chalk.red(figures.squareSmallFilled)} failed.`);
    prgm.log.debug(`---- Konveyor Exit (${code})`);
    await prgm.log.close();

    // eslint-disable-next-line no-process-exit
    process.exit(code);
  }
}
