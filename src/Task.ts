import { Program } from './Program';
import { Event } from './Event';

type Callback = (program: Program) => Promise<void> | void;
type BeforeResponse = { skip: boolean };
type CallbackBefore = (
  program: Program
) => Promise<void | BeforeResponse> | BeforeResponse;

export class Task extends Event {
  // task description
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean = false;
  readonly isRepeatable: boolean = false;

  // state
  protected _executed: boolean = false;
  protected _dependencies: Set<Task> = new Set();

  // actual tasks
  protected _before?: CallbackBefore;
  protected _callback?: Callback;
  protected _after?: Callback;
  protected _afterAll?: Callback;

  constructor({
    name,
    description,
    dependencies = [],
    isPrivate = false,
    isRepeatable = false,
  }: {
    name: string;
    description: string;
    dependencies?: Task[];
    isPrivate?: boolean;
    isRepeatable?: boolean;
  }) {
    super();

    this.name = name;
    this.description = description;
    this._dependencies = new Set(dependencies);
    this.isPrivate = isPrivate;
    this.isRepeatable = isRepeatable;
  }

  get dependencies() {
    return this._dependencies;
  }

  executed(is: boolean) {
    this._executed = is;
  }
  get isExecuted() {
    return this._executed;
  }

  before(callback: CallbackBefore) {
    this._before = callback;
  }

  exec(callback: Callback) {
    this._callback = callback;
  }

  after(callback: Callback) {
    this._after = callback;
  }

  afterAll(callback: Callback) {
    this._afterAll = callback;
  }

  hasAfterAll() {
    return this._afterAll;
  }

  async run(prgm: Program) {
    if (!this._callback) {
      throw new Error(`Task "${this.name}" does not have a main exec()`);
    }

    const entries = Array.from(this._dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.isExecuted && !entry.isRepeatable) {
        continue;
      }

      await entry.run(prgm);
    }

    this.executed(true);

    this.emit('task:start', { task: this });
    this.emit(`task:start:${this.name}`, { task: this });

    prgm.log.debug(`Executing task: ${this.name}`);
    if (this._before) {
      const answer = await this._before(prgm);
      prgm.spinner.stop();

      if (answer && answer.skip) {
        prgm.log.debug('before() returned skip: true');
        this.emit(`task:skipped:${this.name}`, { task: this });
        return;
      }
    }

    await this._callback(prgm);
    prgm.spinner.stop();

    if (this._after) {
      await this._after(prgm);
      prgm.spinner.stop();
    }

    this.emit(`task:stop:${this.name}`, { task: this });
  }
}
