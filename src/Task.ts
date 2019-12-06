import { Program } from './Program';

type Callback = (program: Program) => Promise<void> | void;

export class Task {
  public _dependencies: Set<Task> = new Set();

  readonly name: string;

  readonly description: string;

  protected _global: boolean = true;

  readonly pipe: { [k: string]: Callback | null } = {
    before: null,
    after: null,
    afterAll: null,
  };

  readonly callback: Callback;

  constructor(name: string, description: string, callback: Callback) {
    this.name = name;
    this.description = description;
    this.callback = callback;
  }

  dependencies(...dependencies: Task[]) {
    this._dependencies = new Set(dependencies);
    return this;
  }

  global(is: boolean) {
    this._global = is;
    return this;
  }

  before(callback: Callback) {
    this.pipe.before = callback;
    return this;
  }

  after(callback: Callback) {
    this.pipe.after = callback;
    return this;
  }

  afterAll(callback: Callback) {
    this.pipe.afterAll = callback;
    return this;
  }

  async run(prgm: Program) {
    const entries = Array.from(this._dependencies);
    for (let index = 0; index < entries.length; index++) {
      const entry = entries[index];
      await entry.run(prgm);
    }

    if (this.pipe.before) {
      await this.pipe.before(prgm);
    }

    await this.callback(prgm);

    if (this.pipe.before) {
      await this.pipe.before(prgm);
    }
  }
}
