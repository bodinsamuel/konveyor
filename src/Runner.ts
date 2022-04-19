import { Event } from './Event';
import type { Program } from './Program';
import type { Task } from './Task';
import type { Callback } from './types';

export class Runner extends Event<'task:skipped' | 'task:start' | 'task:stop'> {
  private program: Program;
  private task: Task;
  private afterAlls: Callback[] = [];

  constructor(program: Program, task: Task) {
    super();

    this.program = program;
    this.task = task;
  }

  async run(chainedTask?: Task): Promise<void> {
    const prgm = this.program;
    const task = chainedTask || this.task;

    // Run dependencies first
    const entries = Array.from(task.dependencies);
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

    prgm.log.debug(`Executing task: ${task.name}`);

    // Register afterAll
    if (task.afterAll) {
      prgm.log.debug('afterAll() registered');
      this.afterAlls.push(task.afterAll);
    }

    // Execute before()
    if (task.before) {
      const answer = await task.before(prgm);
      prgm.spinner.stop();

      if (answer?.skip) {
        prgm.log.debug('before() returned skip: true');
        this.emit(`task:skipped`, { task: this });
        return;
      }
    }

    // Main callback
    if (task.exec) {
      await task.exec(prgm);
      prgm.spinner.stop();
    }

    // After
    if (task.after) {
      await task.after(prgm);
      prgm.spinner.stop();
    }

    this.emit(`task:stop`, { task: this });
  }

  async afterAll(): Promise<void> {
    try {
      this.program.log.debug('Running afterAll()');
      await Promise.all(
        this.afterAlls.map((callback) => {
          return callback(this.program);
        })
      );
    } catch (e) {
      this.program.log.error(e);
    }
  }
}
