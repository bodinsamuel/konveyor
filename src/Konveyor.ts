import path from 'path';

import { Command, Option } from 'commander';
import figures from 'figures';
import * as kolorist from 'kolorist';

import { Event } from './Event';
import { Logger } from './Logger';
import { Program } from './Program';
import { Runner } from './Runner';
import type { Task } from './Task';
import { DuplicateTaskError, ExitError, NoTasksError } from './errors';
import { toAbsolute } from './helpers/fs';
import { loadTasksFromPath } from './helpers/loadTasksFromPath';
import { parseArgv } from './helpers/parseArgv';
import type { ConfigDefault } from './types';
import type { Spinner } from './utils';
import { intro, clearConsole, exit } from './utils';

interface Args<TConfig extends ConfigDefault> {
  name: string;
  version: string;
  tasks?: Task<TConfig>[];
  tasksPath?: string;
  logger?: Logger;
  spinner?: Spinner;
  command?: Command;
  program?: Program;
  clearOnStart?: boolean;
  config?: TConfig;
}

export class Konveyor<
  TConfig extends ConfigDefault
> extends Event<'konveyor:start'> {
  readonly tasksPublic: Task<TConfig>[] = [];
  readonly log: Logger;

  // state
  private name: string;
  private version: string;
  private task?: Task<TConfig>;
  private tasks: Task<TConfig>[] = [];
  private tasksPath?: string;
  private clearOnStart: boolean;
  private path: string;
  private config?: TConfig;

  // services
  private program: Program;
  private commander: Command;
  private runner?: Runner<TConfig>;

  constructor(args: Args<TConfig>) {
    super();

    this.name = args.name;
    this.version = args.version;
    this.tasks = args.tasks || [];
    this.path = path.dirname(require!.main!.filename);
    this.tasksPath = args.tasksPath
      ? toAbsolute(args.tasksPath, this.path)
      : undefined;
    this.clearOnStart = args.clearOnStart === true;

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
    this.config = args.config;
  }

  static option(flags: string, description?: string): Option {
    return new Option(flags, description);
  }

  get pickedTask(): Task<TConfig> | undefined {
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
      if (this.tasksPath) {
        this.tasks = [
          ...this.tasks,
          ...(await loadTasksFromPath({ dirPath: this.tasksPath, log })),
        ];
      }

      this.registerTasks();

      // display intro
      if (this.clearOnStart) {
        clearConsole();
      }
      log.info(intro(this.name, this.version));

      // console.log('prout');
      const prepared = parseArgv(argv);
      console.log('prep', prepared);

      await this.commander.parseAsync(argv);
      // console.log('edf');
      // console.log(this.commander);

      await this.askForTask();

      if (!this.task) {
        // A throw to make Typescript happy
        throw new Error();
      }

      // run the chosen task
      this.runner = new Runner({
        program: this.program,
        task: this.task,
        config: this.config,
      });
      await this.runner.run();
    } catch (err) {
      console.log('prat');

      console.log(this.commander);

      this.program.spinner.fail();
      if (!(err instanceof ExitError)) {
        log.error(err);
      }
      await this.exit(1);
    }

    await this.exit(0);
  }

  /**
   * Register tasks into Konveyor.
   */
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
      // const cmd = commander
      //   .command( task.name)
      //   .description(task.description)
      //   .action(() => {
      //     this.task = task;
      //   });

      // if (task.options && task.options?.length > 0) {
      //   task.options.forEach((option) => {
      //     cmd.addOption(option);
      //   });
      // }
    });

    log.debug(`Registered ${tasks.length} tasks`);
  }

  /**
   * Ask for a task.
   */
  async askForTask(): Promise<void> {
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

  /**
   * Terminate cli.
   */
  async exit(code: number): Promise<void> {
    const { log, program } = this;
    program.spinner.fail();

    if (this.runner) {
      this.runner.afterAll();
    }

    // Display final message
    if (code > 0) {
      log.info('');
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
