import type { CallbackAll } from './@types/command';
import type { ConfigDefault } from './@types/config';
import type { ValidExecutionItem } from './@types/parser';
import type { Command } from './Command';
import { Event } from './Event';
import type { RootCommand } from './helpers/RootCommand';
import type { Program } from './program';
// import type { DirMapping } from './parser/loadCommandsFromFs';

export class Runner<TConfig extends ConfigDefault> extends Event<
  'command:run' | 'command:skipped' | 'command:stop'
> {
  private program: Program;
  private config?: TConfig;
  private afterAlls: CallbackAll<TConfig>[] = [];
  private validatedPlan;
  private rootCommand;

  constructor(args: {
    program: Program;
    config?: TConfig;
    validatedPlan: ValidExecutionItem[];
    rootCommand: RootCommand;
  }) {
    super();

    this.program = args.program;
    this.config = args.config;
    this.validatedPlan = args.validatedPlan;
    this.rootCommand = args.rootCommand;
  }

  async start(): Promise<void> {
    const copy = this.validatedPlan.slice();

    while (copy.length > 0) {
      const item = copy.shift()!;
      await this.runOne(item.command, item.options);
    }
  }

  /**
   * Execute a command.
   */
  async runOne(
    command: Command<TConfig>,
    options: ValidExecutionItem['options']
  ): Promise<void> {
    const { program, config } = this;

    // Run dependencies first
    const entries = command.dependenciesPlan
      ? command.dependenciesPlan(program, options)
      : Array.from(command.dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.isExecuted) {
        continue;
      }

      await this.runOne(entry, {});
    }

    // Mark as executed before executing
    command.executed(true);

    this.emit('command:run', { command });

    program.log.debug(`Executing command: ${command.name}`);

    // Register afterAll
    if (command.afterAll) {
      program.log.debug('afterAll() registered');
      this.afterAlls.push(command.afterAll);
    }

    // Execute before()
    if (command.before) {
      const answer = await command.before(program, options, config);
      program.spinner.stop();

      if (answer?.skip) {
        program.log.debug('before() returned skip: true');
        this.emit(`command:skipped`, { command: this });
        return;
      }
    }

    // Main callback
    if (command.exec) {
      await command.exec(program, options, config);
      program.spinner.stop();
    }

    // After
    if (command.after) {
      await command.after(program, options, config);
      program.spinner.stop();
    }

    this.emit(`command:stop`, { command: this });
  }

  /**
   * Run after everything has been executed.
   */
  async afterAll(): Promise<void> {
    if (this.afterAlls.length <= 0) {
      return;
    }

    try {
      this.program.log.debug('Running afterAll()');
      await Promise.all(
        this.afterAlls.map((callback) => {
          return callback(this.program, this.config);
        })
      );
    } catch (e) {
      this.program.log.error(e);
    }
  }
}
