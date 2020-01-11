import path from 'path';
import chalk from 'chalk';
import { Command } from 'commander';
import figures from 'figures';

import { Task } from './Task';
import { Logger } from './Logger';
import { Program } from './Program';
import { Event } from './Event';
import { Runner } from './Runner';
import { intro, clearConsole, Spinner, exit } from './utils/';
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
  private commandsName: string[] = [];

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

  public registerTasks() {
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
        this.commandsName.push(task.name);
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
    commander.arguments('<command>').action(cmd => {
      commander.outputHelp();
      this.logger.error(
        `  ${chalk.red(`Unknown command ${chalk.yellow(cmd)}.`)}`
      );
    });
  }

  private async askForCommand() {
    if (typeof this.task === 'undefined') {
      const answer = await this.program.choices(
        'What do you want to do?',
        this.commandsName
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

    if (this.runner) {
      this.runner.afterAll();
    }

    // Display final message
    if (code > 0) {
      this.logger.info(
        `${chalk.red(
          figures.squareSmallFilled
        )} Failed. Check "debug.log" to know more`
      );
    } else {
      this.logger.info(`${chalk.magenta(figures.heart)} ${this.name} done.`);
    }

    prgm.log.debug(`---- Konveyor Exit (${code})`);

    // Write final log to file
    await prgm.log.close();

    exit(code);
  }
}
