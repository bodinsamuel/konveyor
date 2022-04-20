import path from 'path';

import { Command } from 'commander';
import figures from 'figures';
import * as kolorist from 'kolorist';

import { Event } from './Event';
import { Logger } from './Logger';
import { Program } from './Program';
import { Runner } from './Runner';
import type { Task } from './Task';
import { DuplicateTaskError, ExitError, NoTasksError } from './errors';
import type { Spinner } from './utils';
import { intro, clearConsole, exit } from './utils';

interface Args {
  name: string;
  version: string;
  tasks: Task[];
  logger?: Logger;
  spinner?: Spinner;
  command?: Command;
  program?: Program;
}

export class Konveyor extends Event<'konveyor:start'> {
  readonly tasksPublic: Task[] = [];
  readonly logger: Logger;

  // state
  private name: string;
  private version: string;
  private task?: Task;
  private tasks: Task[] = [];

  // services
  private program: Program;
  private commander: Command;
  private runner?: Runner;

  constructor({ name, version, logger, tasks, command, program }: Args) {
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

    this.program =
      program ||
      new Program({
        logger: this.logger,
      });
  }

  get pickedTask(): Task | undefined {
    return this.task;
  }

  /**
   * Main entrypoint.
   *
   * @param argv - Process.argv.
   */
  async start(argv: any): Promise<void> {
    this.logger.debug(`---- Konveyor Start [${new Date().toISOString()}]`);
    this.emit('konveyor:start');

    try {
      this.registerTasks();

      // display intro
      clearConsole();
      this.logger.info(intro(this.name, this.version));

      this.commander.parse(argv);

      await this.askForCommand();

      if (!this.task) {
        // A throw to make Typescript happy
        throw new Error();
      }

      // run the chosen task
      this.runner = new Runner(this.program, this.task);
      await this.runner.run();
    } catch (err) {
      if (!(err instanceof ExitError)) {
        this.logger.error(err);
      }
      await this.exit(1);
    }

    await this.exit(0);
  }

  registerTasks(): void {
    const commander = this.commander;
    if (this.tasks.length <= 0) {
      throw new NoTasksError();
    }

    const names: string[] = [];
    this.tasks.forEach((task) => {
      if (names.includes(task.name)) {
        throw new DuplicateTaskError(task.name);
      }
      names.push(task.name);

      if (task.isPrivate === false) {
        this.tasksPublic.push(task);
        commander
          .command(task.name)
          .description(task.description)
          .action(() => {
            this.task = task;
          });
      }
    });

    this.logger.debug(`Registered ${this.tasks.length} tasks`);

    // Final catch all command
    commander.arguments('<command>').action((cmd) => {
      commander.outputHelp();
      this.logger.error(
        `  ${kolorist.red(`Unknown command ${kolorist.yellow(cmd)}.`)}`
      );
    });
  }

  async askForCommand(): Promise<void> {
    if (this.task) {
      this.logger.info(
        `${kolorist.green('?')} ${kolorist.bold(
          'What do you want to do?'
        )} ${kolorist.cyan(this.task.name)}`
      );
      return;
    }

    const list = this.tasksPublic.map((task) => {
      return {
        name: task.name,
        hint: task.description,
      };
    });
    const answer = await this.program.choices('What do you want to do?', list);

    this.task = this.tasks.find((task) => task.name === answer);
  }

  async exit(code: number): Promise<void> {
    const prgm = this.program;
    prgm.spinner.fail();

    if (this.runner) {
      this.runner.afterAll();
    }

    // Display final message
    if (code > 0) {
      this.logger.info(
        `${kolorist.red(
          figures.squareSmallFilled
        )} Failed. Check "debug.log" to know more`
      );
    } else {
      this.logger.info(`${kolorist.magenta(figures.heart)} ${this.name} done.`);
    }

    prgm.log.debug(`---- Konveyor Exit (${code})`);

    // Write final log to file
    await prgm.log.close();

    exit(code);
  }
}
