import { Program } from './Program';

type Callback = (program: Program) => Promise<void> | void;
type BeforeResponse = { skip: boolean };
type CallbackBefore = (
  program: Program
) => Promise<void | BeforeResponse> | BeforeResponse;

export class Task {
  // task description
  readonly name: string;
  readonly description: string;
  protected _private: boolean = false;
  protected _repeatable: boolean = false;

  // state
  public executed: boolean = false;
  protected _dependencies: Set<Task> = new Set();

  // actual tasks
  protected _before?: CallbackBefore;
  protected _callback: Callback;
  protected _after?: Callback;
  protected _afterAll?: Callback;

  constructor(name: string, description: string, callback: Callback) {
    this.name = name;
    this.description = description;
    this._callback = callback;
  }

  dependsOn(...dependencies: Task[]) {
    this._dependencies = new Set(dependencies);
    return this;
  }
  get dependencies() {
    return this._dependencies;
  }

  private(is: boolean) {
    this._private = is;
    return this;
  }
  get isPrivate() {
    return this._private;
  }

  repeatable(is: boolean) {
    this._repeatable = is;
    return this;
  }
  get isRepeatable() {
    return this._repeatable;
  }

  before(callback: CallbackBefore) {
    this._before = callback;
    return this;
  }

  after(callback: Callback) {
    this._after = callback;
    return this;
  }

  afterAll(callback: Callback) {
    this._afterAll = callback;
    return this;
  }

  async run(prgm: Program) {
    const entries = Array.from(this._dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      if (entry.executed && !entry.repeatable) {
        continue;
      }

      await entry.run(prgm);
    }

    this.executed = true;

    prgm.log('\r');
    prgm.debug(`Executing task: ${this.name}`);
    if (this._before) {
      const answer = await this._before(prgm);
      console.log(answer);
      prgm.spinner.stop(true);
      if (answer && answer.skip) {
        prgm.debug('before() returned skip: true');
        return;
      }
    }

    await this._callback(prgm);
    prgm.spinner.stop(true);

    if (this._after) {
      await this._after(prgm);
      prgm.spinner.stop(true);
    }
  }
}
