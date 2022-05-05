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
  description?: string;
  isPrivate?: boolean;
  options?: Option[];
  dependencies?: Command<TConf>[] | DependenciesPlan<TConf>;

  before?: Callback<TConf>;
  exec?: Callback<TConf>;
  after?: Callback<TConf>;
  afterAll?: CallbackAll<TConf>;
}

let i = 0;

export class Command<TConf extends ConfigDefault> {
  readonly __Command = true;

  #name: string;
  #description: string;
  #isPrivate: boolean = false;
  #options: Option[] = [];
  #id: number = i++;

  // state
  #executed: boolean = false;
  #dependencies: Set<Command<TConf>> = new Set();
  #dependenciesPlan?: DependenciesPlan<TConf>;

  // actual commands
  #before?: Callback<TConf>;
  #exec?: Callback<TConf>;
  #after?: Callback<TConf>;
  #afterAll?: CallbackAll<TConf>;

  constructor(args: CommandArgs<TConf>) {
    this.#name = args.name;
    this.#description = args.description || '';
    this.#isPrivate = args.isPrivate === true;

    this.#before = args.before;
    this.#exec = args.exec;
    this.#after = args.after;
    this.#afterAll = args.afterAll;

    if (args.options) {
      this.#options = args.options;
    }

    // Check dependencies
    if (args.dependencies && Array.isArray(args.dependencies)) {
      this.#dependencies = new Set(args.dependencies);
      this.#dependencies.forEach((dep) => {
        if (typeof dep === 'undefined') {
          throw new CommandUndefinedError(this.#name);
        }
      });
    } else if (args.dependencies) {
      this.#dependenciesPlan = args.dependencies;
    }
  }

  get [Symbol.toStringTag](): string {
    return `${this.name}`;
  }

  get name(): string {
    return this.#name;
  }

  get description(): string {
    return this.#description;
  }

  get id(): number {
    return this.#id;
  }

  get isPrivate(): boolean {
    return this.#isPrivate;
  }

  static option(long: string, short?: string): Option {
    return new Option(long, short);
  }

  get options(): Option[] {
    return this.#options;
  }

  get dependencies(): Set<Command<TConf>> {
    return this.#dependencies;
  }

  get dependenciesPlan(): DependenciesPlan<TConf> | undefined {
    return this.#dependenciesPlan;
  }

  executed(is: boolean): void {
    this.#executed = is;
  }

  get isExecuted(): boolean {
    return this.#executed;
  }

  get before(): CallbackBefore<TConf> | undefined {
    return this.#before;
  }

  hasBefore(): boolean {
    return Boolean(this.#before);
  }

  get exec(): Callback<TConf> | undefined {
    return this.#exec;
  }
  set exec(e: Callback<TConf> | undefined) {
    this.#exec = e;
  }

  hasExec(): boolean {
    return Boolean(this.#exec);
  }

  get after(): Callback<TConf> | undefined {
    return this.#after;
  }

  hasAfter(): boolean {
    return Boolean(this.#after);
  }

  get afterAll(): CallbackAll<TConf> | undefined {
    return this.#afterAll;
  }

  hasAfterAll(): boolean {
    return Boolean(this.#afterAll);
  }
}
