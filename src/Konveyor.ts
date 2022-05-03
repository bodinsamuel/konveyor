import path from 'path';
import util from 'util';

import figures from 'figures';
import * as kolorist from 'kolorist';

import type { ConfigDefault } from './@types/config';
import type { ValidatedPlan, ValidationPlan } from './@types/parser';
import type { Command } from './Command';
import { Event } from './Event';
import { Logger } from './Logger';
import { Program } from './Program';
import { Runner } from './Runner';
import { ExitError } from './errors';
import type { RootCommand } from './helpers/RootCommand';
import { defaultRootCommand } from './helpers/RootCommand';
import { toAbsolute } from './helpers/fs';
import { help } from './helpers/help';
import { fsToValidationPlan } from './parser/fsToValidationPlan';
import type { DirMapping } from './parser/loadCommandsFromFs';
import { loadCommandsFromFs } from './parser/loadCommandsFromFs';
import { parseArgv } from './parser/parseArgv';
import { validateExecutionPlan } from './parser/validateExecutionPlan';
import type { Spinner } from './utils';
import { clearConsole, exit } from './utils';

interface Args<TConfig extends ConfigDefault> {
  name: string;
  description?: string;
  version: string;
  commands?: Command<TConfig>[];
  commandsPath?: string;
  logger?: Logger;
  spinner?: Spinner;
  program?: Program;
  clearOnStart?: boolean;
  config?: TConfig;
  rootCommand?: RootCommand;
}

export class Konveyor<
  TConfig extends ConfigDefault
> extends Event<'konveyor:start'> {
  // readonly commandsPublic: Command<TConfig>[] = [];
  readonly log: Logger;

  // state
  private name: string;
  private description?: string;
  private version: string;
  private commands: DirMapping[] = [];
  private commandsPath?: string;
  private clearOnStart: boolean;
  private path: string;
  private rootCommand: RootCommand;
  private validationPlan: ValidationPlan = {
    commands: [],
    options: [],
  };

  // services
  private config?: TConfig;
  private program: Program;
  private runner?: Runner<TConfig>;

  constructor(args: Args<TConfig>) {
    super();

    this.name = args.name;
    this.description = args.description;
    this.version = args.version;
    this.path = path.dirname(require!.main!.filename);
    this.commandsPath = args.commandsPath
      ? toAbsolute(args.commandsPath, this.path)
      : undefined;
    this.clearOnStart = args.clearOnStart === true;

    // if (args.commands) {
    //   this.commands[0] = {
    //     dirPath: './',
    //     paths: [],
    //     isTopic: false,
    //     cmds: args.commands.map((command) => {
    //       return {
    //         basename: command.name,
    //         cmd: command,
    //         paths: [command.name],
    //       };
    //     }),
    //   };
    // }

    this.log =
      args.logger ||
      new Logger({
        folder: this.path,
      });

    this.program =
      args.program ||
      new Program({
        logger: this.log,
      });
    this.config = args.config;

    this.rootCommand = args.rootCommand || defaultRootCommand;
    this.validationPlan.options = this.rootCommand.options!.map((opts) => {
      return opts.toJSON();
    });
  }

  /**
   * Main entrypoint.
   
   */
  async start(argv: string[]): Promise<void> {
    const { log, commandsPath } = this;

    log.debug(`---- Konveyor Start [${new Date().toISOString()}]`);
    this.emit('konveyor:start');

    try {
      if (commandsPath) {
        const dirs = await loadCommandsFromFs({ dirPath: commandsPath, log });
        log.debug(util.inspect(dirs, { depth: null }));
        this.validationPlan = fsToValidationPlan(dirs);
        log.debug(util.inspect(this.commands, { depth: null }));
      }

      if (this.clearOnStart) {
        clearConsole();
      }

      const validated = (await this.parse(argv))!;
      if (!validated) {
        return;
      }

      const hasCommand = validated.plan[0].command;
      if (hasCommand) {
        this.logCommand(hasCommand);
      } else {
        await this.askForCommand();
      }

      // run the chosen command
      this.runner = new Runner({
        program: this.program,
        command: hasCommand
          ? this.commands[0].cmds.find(({ cmd }) => cmd.name === hasCommand)!
              .cmd
          : this.rootCommand,
        config: this.config,
      });
      await this.runner.run();
    } catch (err) {
      this.program.spinner.fail();
      if (!(err instanceof ExitError)) {
        log.error(err);
      }
      await this.exit(1);
    }

    await this.exit(0);
  }

  /**
   * Parse and exit if any error.
   */
  async parse(argv: string[]): Promise<ValidatedPlan | undefined> {
    const { log } = this;
    log.debug(util.inspect(this.validationPlan, { depth: null }));
    const parsed = parseArgv(argv);
    const validated = validateExecutionPlan(parsed.flat, this.validationPlan);

    if (validated.success) {
      if (validated.plan.length <= 0) {
        log.info(this.getHelp([]));
        log.info('\r\n');
        return;
      }

      return validated;
    }

    // const vp = this.validationPlan;
    for (const plan of validated.plan) {
      if (!plan.unknownOption && !plan.unknownCommand) {
        // if (plan.command) {
        //   vp = vp.commands.find((command) => command.command === plan.command)!;
        // }
        continue;
      }

      log.info(this.getHelp([]));
      log.info('\r\n');

      if (plan.unknownOption) {
        log.error(`Unknown option: ${plan.unknownOption}`);
        break;
      }
      if (plan.unknownCommand) {
        log.error(`Unknown command: ${plan.unknownCommand}`);
        break;
      }
    }

    await this.exit(1);
  }

  logCommand(name: string): void {
    this.log.info(
      `${kolorist.green('?')} ${kolorist.bold(
        'What do you want to do?'
      )} ${kolorist.cyan(name)}`
    );
  }

  /**
   * Ask for a command.
   */
  async askForCommand(): Promise<void> {
    const list = this.commands[0].cmds.map(({ cmd }) => {
      return {
        name: cmd.name,
        hint: cmd.description,
      };
    });

    const answer = await this.program.choices<string>(
      'What do you want to do?',
      list
    );
    // this.validationPlan.commands.push({
    //   command: answer,
    //   options: [],
    // });
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
      const debug = `${this.path}/debug.log`;
      log.info(
        `${kolorist.red(
          figures.squareSmallFilled
        )} Failed. Check "${kolorist.underline(debug)}" to know more`
      );
    } else {
      log.info(`${kolorist.magenta(figures.heart)} ${this.name} done.`);
    }

    log.debug(`---- Konveyor Exit (${code})`);

    // Write final log to file
    await log.close();

    exit(code);
  }

  private getHelp(commandsPath: string[]): string {
    return help({
      name: this.name,
      description: this.description,
      version: this.version,
      rootCommand: this.rootCommand,
      commands: this.commands,
      commandsPath,
    });
  }
}
