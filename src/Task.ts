import { TaskUndefinedError } from './errors';
import type { CallbackBefore, Callback } from './types';

export class Task {
  // task description
  readonly name: string;
  readonly description: string;
  readonly isPrivate: boolean = false;

  // state
  protected _executed: boolean = false;
  protected _dependencies: Set<Task> = new Set();

  // actual tasks
  protected _before?: CallbackBefore;
  protected _exec?: Callback;
  protected _after?: Callback;
  protected _afterAll?: Callback;

  constructor({
    name,
    description,
    dependencies = [],
    before,
    exec,
    after,
    afterAll,
    isPrivate = false,
  }: {
    name: string;
    description: string;
    dependencies?: Task[];
    isPrivate?: boolean;

    before?: CallbackBefore;
    exec?: Callback;
    after?: Callback;
    afterAll?: Callback;
  }) {
    this.name = name;
    this.description = description;
    this._dependencies = new Set(dependencies);
    this.isPrivate = isPrivate;

    this._before = before;
    this._exec = exec;
    this._after = after;
    this._afterAll = afterAll;

    // Check dependencies
    this._dependencies.forEach((dep) => {
      if (typeof dep === 'undefined') {
        throw new TaskUndefinedError(this.name);
      }
    });
  }

  get dependencies() {
    return this._dependencies;
  }

  executed(is: boolean): void {
    this._executed = is;
  }

  get isExecuted(): boolean {
    return this._executed;
  }

  get before() {
    return this._before;
  }

  hasBefore() {
    return Boolean(this._before);
  }

  get exec() {
    return this._exec;
  }

  hasExec() {
    return Boolean(this._exec);
  }

  get after() {
    return this._after;
  }

  hasAfter() {
    return Boolean(this._after);
  }

  get afterAll() {
    return this._afterAll;
  }

  hasAfterAll() {
    return Boolean(this._afterAll);
  }
}
