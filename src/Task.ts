import { Option } from './Option';
import { TaskUndefinedError } from './errors';
import type { CallbackBefore, Callback, ConfigDefault } from './types';

export interface TaskArgs<TConf extends ConfigDefault> {
  name: string;
  description: string;
  isPrivate?: boolean;
  options?: Option[];
  dependencies?: Task<TConf>[] | (() => Task<TConf>[]);

  before?: CallbackBefore;
  exec?: Callback<TConf>;
  after?: Callback<TConf>;
  afterAll?: Callback<TConf>;
}

export class Task<TConf extends ConfigDefault> {
  // task description
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean = false;
  readonly options?: Option[] = [];

  // state
  protected _executed: boolean = false;
  protected _dependencies: Set<Task<TConf>> = new Set();
  protected _dependenciesPlan?: () => Task<TConf>[];

  // actual tasks
  protected _before?: CallbackBefore;
  protected _exec?: Callback<TConf>;
  protected _after?: Callback<TConf>;
  protected _afterAll?: Callback<TConf>;

  constructor(args: TaskArgs<TConf>) {
    this.name = args.name;
    this.description = args.description;
    this.isPrivate = args.isPrivate === true;
    this.options = args.options;

    this._before = args.before;
    this._exec = args.exec;
    this._after = args.after;
    this._afterAll = args.afterAll;

    // Check dependencies
    if (args.dependencies && Array.isArray(args.dependencies)) {
      this._dependencies = new Set(args.dependencies);
      this._dependencies.forEach((dep) => {
        if (typeof dep === 'undefined') {
          throw new TaskUndefinedError(this.name);
        }
      });
    } else if (args.dependencies) {
      this._dependenciesPlan = args.dependencies;
    }
  }

  static option(long: string, short?: string): Option {
    return new Option(long, short);
  }

  get dependencies(): Set<Task<TConf>> {
    return this._dependencies;
  }

  get dependenciesPlan(): (() => Task<TConf>[]) | undefined {
    return this._dependenciesPlan;
  }

  executed(is: boolean): void {
    this._executed = is;
  }

  get isExecuted(): boolean {
    return this._executed;
  }

  get before(): CallbackBefore | undefined {
    return this._before;
  }

  hasBefore(): boolean {
    return Boolean(this._before);
  }

  get exec(): Callback<TConf> | undefined {
    return this._exec;
  }

  hasExec(): boolean {
    return Boolean(this._exec);
  }

  get after(): Callback<TConf> | undefined {
    return this._after;
  }

  hasAfter(): boolean {
    return Boolean(this._after);
  }

  get afterAll(): Callback<TConf> | undefined {
    return this._afterAll;
  }

  hasAfterAll(): boolean {
    return Boolean(this._afterAll);
  }
}
