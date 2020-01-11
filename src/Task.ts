import { CallbackBefore, Callback } from './types';
import { TaskUndefinedError } from './errors';

export class Task {
  // task description
  public readonly name: string;
  public readonly description: string;
  public readonly isPrivate: boolean = false;

  // state
  protected _executed: boolean = false;
  protected _dependencies: Set<Task> = new Set();

  // actual tasks
  protected _before?: CallbackBefore;
  protected _exec?: Callback;
  protected _after?: Callback;
  protected _afterAll?: Callback;

  public constructor({
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
    this._dependencies.forEach(dep => {
      if (typeof dep === 'undefined') {
        throw new TaskUndefinedError(this.name);
      }
    });
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

  public get before() {
    return this._before;
  }

  public hasBefore() {
    return Boolean(this._before);
  }

  public get exec() {
    return this._exec;
  }

  public hasExec() {
    return Boolean(this._exec);
  }

  public get after() {
    return this._after;
  }

  public hasAfter() {
    return Boolean(this._after);
  }

  public get afterAll() {
    return this._afterAll;
  }

  public hasAfterAll() {
    return Boolean(this._afterAll);
  }
}
