import { Program } from './Program';
import { Event } from './Event';
import { Task } from './Task';
import { Callback } from './types';

export class Runner extends Event<'task:start' | 'task:skipped' | 'task:stop'> {
  private program: Program;
  private task: Task;
  private afterAlls: Callback[] = [];

  public constructor(program: Program, task: Task) {
    super();

    this.program = program;
    this.task = task;
  }

  public async run(chainedTask?: Task) {
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
      this.afterAlls.push(task.afterAll);
    }

    // Execute before()
    if (task.before) {
      const answer = await task.before(prgm);
      prgm.spinner.stop();

      if (answer && answer.skip) {
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

  public async afterAll() {
    try {
      await Promise.all(
        this.afterAlls.map(callback => {
          return callback(this.program);
        })
      );
    } catch (e) {
      this.program.log.error(e);
    }
  }
}
