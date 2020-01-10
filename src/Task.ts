import { Program } from './Program';
import { Event } from './Event';
import { CallbackBefore, Callback } from './types';

export class Task extends Event {
  // task description
  public readonly name: string;
  public readonly description: string;
  public readonly isPrivate: boolean = false;

  // state
  protected _executed: boolean = false;
  protected _dependencies: Set<Task> = new Set();

  // actual tasks
  protected _before?: CallbackBefore;
  protected _callback?: Callback;
  protected _after?: Callback;
  protected _afterAll?: Callback;

  public constructor({
    name,
    description,
    dependencies = [],
    isPrivate = false,
  }: {
    name: string;
    description: string;
    dependencies?: Task[];
    isPrivate?: boolean;
  }) {
    super();

    this.name = name;
    this.description = description;
    this._dependencies = new Set(dependencies);
    this.isPrivate = isPrivate;
  }

  public get dependencies() {
    return this._dependencies;
  }

  public executed(is: boolean) {
    this._executed = is;
  }
  public get isExecuted() {
    return this._executed;
  }

  public before(callback: CallbackBefore) {
    this._before = callback;
  }

  public exec(callback: Callback) {
    this._callback = callback;
  }

  public after(callback: Callback) {
    this._after = callback;
  }

  public afterAll(callback: Callback) {
    this._afterAll = callback;
  }

  public hasAfterAll() {
    return this._afterAll;
  }

  public async run(prgm: Program) {
    if (!this._callback) {
      throw new Error(`Task "${this.name}" does not have a main exec()`);
    }

    // Run dependencies first
    const entries = Array.from(this._dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.isExecuted) {
        continue;
      }

      await entry.run(prgm);
    }

    // Mark as executed before executing
    this.executed(true);

    this.emit('task:start', { task: this });
    this.emit(`task:start:${this.name}`, { task: this });

    prgm.log.debug(`Executing task: ${this.name}`);

    // Execute before()
    if (this._before) {
      const answer = await this._before(prgm);
      prgm.spinner.stop();

      if (answer && answer.skip) {
        prgm.log.debug('before() returned skip: true');
        this.emit(`task:skipped:${this.name}`, { task: this });
        return;
      }
    }

    // Main callback
    await this._callback(prgm);
    prgm.spinner.stop();

    // After
    if (this._after) {
      await this._after(prgm);
      prgm.spinner.stop();
    }

    this.emit(`task:stop:${this.name}`, { task: this });
  }
}
