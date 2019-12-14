import path from 'path';

import chalk from 'chalk';
import { Command } from 'commander';

import { Task } from './Task';
import { Logger } from './Logger';
import { Program } from './Program';
import { intro, clearConsole, Spinner } from './utils/';
import { Event } from './Event';

interface Args {
  name: string;
  version: string;
  tasks: Task[];
  logger?: Logger;
  spinner?: Spinner;
}

export class Konveyor extends Event {
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

  constructor({ name, version, logger, tasks }: Args) {
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
    this.logger.debug(`---- Konveyor Start [${new Date().toISOString()}]`);
    try {
      await this.registerTasks();
    } catch (err) {
      this.logger.error(err);
      await this.exit(1);
    }

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
      await this.exit(1);
    }

    this.logger.info('✅ Done');
    await this.exit(0);
  }

  private async registerTasks() {
    const commander = this.commander;

    if (this.tasks.length <= 0) {
      throw new Error(
        `No tasks were registered, use program.tasks() to register your tasks`
      );
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
        `  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`)
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

  async exit(code: number) {
    await this.onExit();
    await this.program.exit(code);
  }

  private async onExit() {
    await Promise.all(
      this.tasks.map(task => {
        if (!task.isExecuted) {
          return null;
        }

        if (task.hasAfterAll()) {
          return task.hasAfterAll()!(this.program);
        }
        return null;
      })
    );
  }
}
