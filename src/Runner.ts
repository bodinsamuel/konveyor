import type { ConfigDefault } from './@types/config';
import type { Callback } from './@types/task';
import { Event } from './Event';
import type { Program } from './Program';
import type { Task } from './Task';

export class Runner<TConfig extends ConfigDefault> extends Event<
  'task:skipped' | 'task:start' | 'task:stop'
> {
  private program: Program;
  private task: Task<TConfig>;
  private config?: TConfig;
  private afterAlls: Callback<TConfig>[] = [];

  constructor(args: {
    program: Program;
    task: Task<TConfig>;
    config?: TConfig;
  }) {
    super();

    this.program = args.program;
    this.task = args.task;
    this.config = args.config;
  }

  /**
   * Execute a task.
   */
  async run(chainedTask?: Task<TConfig>): Promise<void> {
    const { program, config } = this;
    const task = chainedTask || this.task;

    // Run dependencies first
    const entries = task.dependenciesPlan
      ? task.dependenciesPlan()
      : Array.from(task.dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.isExecuted) {
        continue;
      }

      await this.run(entry);
    }

    // Mark as executed before executing
    task.executed(true);

    this.emit('task:start', { task });

    program.log.debug(`Executing task: ${task.name}`);

    // Register afterAll
    if (task.afterAll) {
      program.log.debug('afterAll() registered');
      this.afterAlls.push(task.afterAll);
    }

    // Execute before()
    if (task.before) {
      const answer = await task.before(program);
      program.spinner.stop();

      if (answer?.skip) {
        program.log.debug('before() returned skip: true');
        this.emit(`task:skipped`, { task: this });
        return;
      }
    }

    // Main callback
    if (task.exec) {
      await task.exec(program, config);
      program.spinner.stop();
    }

    // After
    if (task.after) {
      await task.after(program, config);
      program.spinner.stop();
    }

    this.emit(`task:stop`, { task: this });
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
