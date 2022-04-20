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
  clearOnStart?: boolean;
}

export class Konveyor extends Event<'konveyor:start'> {
  readonly tasksPublic: Task[] = [];
  readonly log: Logger;

  // state
  private name: string;
  private version: string;
  private task?: Task;
  private tasks: Task[] = [];
  private clearOnStart: boolean;
  private path: string;

  // services
  private program: Program;
  private commander: Command;
  private runner?: Runner;

  constructor(args: Args) {
    super();

    this.name = args.name;
    this.version = args.version;
    this.tasks = args.tasks;
    this.clearOnStart = args.clearOnStart === true;
    this.path = path.dirname(require!.main!.filename);

    this.log =
      args.logger ||
      new Logger({
        folder: this.path,
      });

    this.commander =
      args.command ||
      new Command().version(this.version).usage('<command> [options]');

    this.program =
      args.program ||
      new Program({
        logger: this.log,
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
    const { log } = this;

    log.debug(`---- Konveyor Start [${new Date().toISOString()}]`);
    this.emit('konveyor:start');

    try {
      this.registerTasks();

      // display intro
      if (this.clearOnStart) {
        clearConsole();
      }
      log.info(intro(this.name, this.version));

      await this.commander.parseAsync(argv);

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
        log.error(err);
      }
      await this.exit(1);
    }

    await this.exit(0);
  }

  registerTasks(): void {
    const { commander, log, tasks } = this;
    if (tasks.length <= 0) {
      throw new NoTasksError();
    }

    const names: string[] = [];
    tasks.forEach((task) => {
      if (names.includes(task.name)) {
        throw new DuplicateTaskError(task.name);
      }

      names.push(task.name);

      if (task.isPrivate) {
        return;
      }

      this.tasksPublic.push(task);
      commander
        .command(task.name)
        .description(task.description)
        .action(() => {
          this.task = task;
        });
    });

    log.debug(`Registered ${tasks.length} tasks`);
  }

  async askForCommand(): Promise<void> {
    const { tasks, log, task } = this;

    if (task) {
      log.info(
        `${kolorist.green('?')} ${kolorist.bold(
          'What do you want to do?'
        )} ${kolorist.cyan(task.name)}`
      );
      return;
    }

    const list = this.tasksPublic.map((t) => {
      return {
        name: t.name,
        hint: t.description,
      };
    });

    const answer = await this.program.choices('What do you want to do?', list);
    this.task = tasks.find((t) => t.name === answer);
  }

  async exit(code: number): Promise<void> {
    const { log, program } = this;
    program.spinner.fail();

    if (this.runner) {
      this.runner.afterAll();
    }

    // Display final message
    if (code > 0) {
      log.info(
        `${kolorist.red(figures.squareSmallFilled)} Failed. Check "${
          this.path
        }/debug.log" to know more`
      );
    } else {
      log.info(`${kolorist.magenta(figures.heart)} ${this.name} done.`);
    }

    log.debug(`---- Konveyor Exit (${code})`);

    // Write final log to file
    await log.close();

    exit(code);
  }
}
