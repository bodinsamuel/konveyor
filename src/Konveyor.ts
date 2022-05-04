import path from 'path';
import util from 'util';

import figures from 'figures';
import * as kolorist from 'kolorist';

import type { ConfigDefault } from './@types/config';
import type { ExecutionPlan, ValidationPlan } from './@types/parser';
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
import { getExecutionPlan } from './parser/getExecutionPlan';
import type { DirMapping } from './parser/loadCommandsFromFs';
import { loadCommandsFromFs } from './parser/loadCommandsFromFs';
import { parseArgv } from './parser/parseArgv';
import type { Choice, Spinner } from './utils';
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
  #version: string;

  readonly log: Logger;

  // state
  private name: string;
  private description?: string;
  private dirMapping: DirMapping | undefined;
  private commands?: Command<TConfig>[];
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
    this.#version = args.version;
    this.path = path.dirname(require!.main!.filename);
    this.commandsPath = args.commandsPath
      ? toAbsolute(args.commandsPath, this.path)
      : undefined;
    this.clearOnStart = args.clearOnStart === true;

    this.commands = args.commands;

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
  }

  get version(): string {
    return this.#version;
  }

  getHelp(commandsPath: string[]): string {
    return help({
      name: this.name,
      description: this.description,
      version: this.#version,
      rootCommand: this.rootCommand,
      dirMapping: this.dirMapping!,
      commandsPath,
    });
  }

  /**
   * Main entrypoint.
   */
  async start(argv: string[]): Promise<void> {
    const { log } = this;

    log.debug(`---- Konveyor Start [${new Date().toISOString()}]`);
    this.emit('konveyor:start');

    try {
      await this.loadCommands();

      if (this.clearOnStart) {
        clearConsole();
      }

      const validated = (await this.parse(argv))!;
      if (!validated) {
        return;
      }
      this.rootCommand.exec = this.rootCommand.prepare(this);

      // run the chosen command
      this.runner = new Runner({
        program: this.program,
        config: this.config,
        dirMapping: this.dirMapping!,
        validationPlan: this.validationPlan,
        validatedPlan: validated.plan,
        rootCommand: this.rootCommand,
      });
      await this.runner.start();
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
   * Load commands from file system and register validation plan.
   */
  async loadCommands(): Promise<void> {
    const { log, commandsPath } = this;

    // Create a fake dir mapping if we specify raw commands
    this.dirMapping = {
      dirPath: this.path,
      isTopic: false,
      paths: [],
      subs: [],
      cmds: (this.commands ?? []).map((cmd) => {
        return {
          basename: cmd.name,
          cmd,
          paths: [],
        };
      }),
    };

    if (!commandsPath) {
      return;
    }

    const dirMapping = await loadCommandsFromFs({
      dirPath: commandsPath,
      log,
    });

    // Manual merge
    this.dirMapping.cmds = [...this.dirMapping.cmds, ...dirMapping.cmds];
    this.dirMapping.subs = dirMapping.subs;

    log.debug('Loaded from FS:');
    log.debug(util.inspect(this.dirMapping, { depth: null }));

    this.validationPlan = fsToValidationPlan(this.dirMapping);
    log.debug('Validation plan:');
    log.debug(util.inspect(this.validationPlan, { depth: null }));

    this.validationPlan.options = this.rootCommand.options!.map((opts) => {
      return opts.toJSON();
    });
  }

  /**
   * Parse and exit if any error.
   */
  async parse(argv: string[]): Promise<ExecutionPlan | undefined> {
    const { log } = this;
    const parsed = parseArgv(argv);
    const execution = getExecutionPlan(parsed.flat, this.validationPlan);

    log.debug('Execution plan:');
    log.debug(util.inspect(execution, { depth: null }));

    if (execution.success) {
      if (execution.plan.length <= 0) {
        return;
      }

      return execution;
    }

    const paths: string[] = [];
    function forCommand(): string {
      if (paths.length <= 0) return '';
      return ` for command ${kolorist.lightBlue(paths.join('>'))}`;
    }

    for (const plan of execution.plan) {
      if (plan.command) paths.push(plan.command);
      if (!plan.unknownOption && !plan.unknownCommand) {
        // if (plan.command) {
        //   vp = vp.commands.find((command) => command.command === plan.command)!;
        // }
        continue;
      }

      log.info(this.getHelp([]));
      log.info('\r\n');

      if (plan.unknownOption) {
        log.error(
          `Unknown option: ${kolorist.yellow(
            plan.unknownOption.join(' ')
          )}${forCommand()}`
        );
        break;
      }
      if (plan.unknownCommand) {
        log.error(
          `Unknown command: ${kolorist.yellow(
            plan.unknownCommand
          )}${forCommand()}`
        );
        break;
      }
    }

    await this.exit(1);
  }

  /**
   * Ask for a command.
   */
  async askForCommand(): Promise<string> {
    const list: Choice[] = [];
    for (const { cmd } of this.dirMapping!.cmds) {
      if (cmd.isPrivate) {
        continue;
      }
      list.push({
        name: cmd.name,
        hint: cmd.description,
      });
    }

    return await this.program.choices<string>('What do you want to do?', list);
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
    }

    log.debug(`---- Konveyor Exit (${code})`);

    // Write final log to file
    await log.close();

    exit(code);
  }
}
