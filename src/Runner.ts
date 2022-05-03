import type { Callback } from './@types/command';
import type { ConfigDefault } from './@types/config';
import type { Command } from './Command';
import { Event } from './Event';
import type { Program } from './Program';

export class Runner<TConfig extends ConfigDefault> extends Event<
  'command:skipped' | 'command:start' | 'command:stop'
> {
  private program: Program;
  private command: Command<TConfig>;
  private config?: TConfig;
  private afterAlls: Callback<TConfig>[] = [];

  constructor(args: {
    program: Program;
    command: Command<TConfig>;
    config?: TConfig;
  }) {
    super();

    this.program = args.program;
    this.command = args.command;
    this.config = args.config;
  }

  /**
   * Execute a command.
   */
  async run(chainedCommand?: Command<TConfig>): Promise<void> {
    const { program, config } = this;
    const command = chainedCommand || this.command;

    // Run dependencies first
    const entries = command.dependenciesPlan
      ? command.dependenciesPlan()
      : Array.from(command.dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.isExecuted) {
        continue;
      }

      await this.run(entry);
    }

    // Mark as executed before executing
    command.executed(true);

    this.emit('command:start', { command });

    program.log.debug(`Executing command: ${command.name}`);

    // Register afterAll
    if (command.afterAll) {
      program.log.debug('afterAll() registered');
      this.afterAlls.push(command.afterAll);
    }

    // Execute before()
    if (command.before) {
      const answer = await command.before(program);
      program.spinner.stop();

      if (answer?.skip) {
        program.log.debug('before() returned skip: true');
        this.emit(`command:skipped`, { command: this });
        return;
      }
    }

    // Main callback
    if (command.exec) {
      await command.exec(program, config);
      program.spinner.stop();
    }

    // After
    if (command.after) {
      await command.after(program, config);
      program.spinner.stop();
    }

    this.emit(`command:stop`, { command: this });
  }

  async afterAll(): Promise<void> {
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
