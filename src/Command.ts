import type {
  CallbackBefore,
  Callback,
  CallbackAll,
  DependenciesPlan,
} from './@types/command';
import type { ConfigDefault } from './@types/config';
import { Option } from './Option';
import { CommandUndefinedError } from './errors';

export interface CommandArgs<TConf extends ConfigDefault> {
  name: string;
  description: string;
  isPrivate?: boolean;
  options?: Option[];
  dependencies?: Command<TConf>[] | DependenciesPlan<TConf>;

  before?: Callback<TConf>;
  exec?: Callback<TConf>;
  after?: Callback<TConf>;
  afterAll?: CallbackAll<TConf>;
}

export class Command<TConf extends ConfigDefault> {
  // command description
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean = false;
  readonly options?: Option[] = [];

  // state
  protected _executed: boolean = false;
  protected _dependencies: Set<Command<TConf>> = new Set();
  protected _dependenciesPlan?: DependenciesPlan<TConf>;

  // actual commands
  protected _before?: Callback<TConf>;
  protected _exec?: Callback<TConf>;
  protected _after?: Callback<TConf>;
  protected _afterAll?: CallbackAll<TConf>;

  constructor(args: CommandArgs<TConf>) {
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
          throw new CommandUndefinedError(this.name);
        }
      });
    } else if (args.dependencies) {
      this._dependenciesPlan = args.dependencies;
    }
  }

  static option(long: string, short?: string): Option {
    return new Option(long, short);
  }

  get dependencies(): Set<Command<TConf>> {
    return this._dependencies;
  }

  get dependenciesPlan(): DependenciesPlan<TConf> | undefined {
    return this._dependenciesPlan;
  }

  executed(is: boolean): void {
    this._executed = is;
  }

  get isExecuted(): boolean {
    return this._executed;
  }

  get before(): CallbackBefore<TConf> | undefined {
    return this._before;
  }

  hasBefore(): boolean {
    return Boolean(this._before);
  }

  get exec(): Callback<TConf> | undefined {
    return this._exec;
  }
  set exec(e: Callback<TConf> | undefined) {
    this._exec = e;
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

  get afterAll(): CallbackAll<TConf> | undefined {
    return this._afterAll;
  }

  hasAfterAll(): boolean {
    return Boolean(this._afterAll);
  }
}
