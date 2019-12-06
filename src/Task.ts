import { Program } from './Program';

type Callback = (program: Program) => Promise<void> | void;
type BeforeResponse = { skip: boolean };
type CallbackBefore = (
  program: Program
) => Promise<void | BeforeResponse> | BeforeResponse;

export class Task {
  public _dependencies: Set<Task> = new Set();

  readonly name: string;

  readonly description: string;

  protected _isPrivate: boolean = false;

  protected _before?: CallbackBefore;
  protected _callback: Callback;
  protected _after?: Callback;
  protected _afterAll?: Callback;

  constructor(name: string, description: string, callback: Callback) {
    this.name = name;
    this.description = description;
    this._callback = callback;
  }

  dependencies(...dependencies: Task[]) {
    this._dependencies = new Set(dependencies);
    return this;
  }

  private(is: boolean) {
    this._isPrivate = is;
    return this;
  }
  get isPrivate() {
    return this._isPrivate;
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
      await entry.run(prgm);
    }

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
