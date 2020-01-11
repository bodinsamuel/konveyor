import { ExecaChildProcess } from 'execa';
import { Program } from '../Program';

// Task
export type Callback = (program: Program) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore = (
  program: Program
) => Promise<void | BeforeResponse> | BeforeResponse | void;

// Store
export type StoreGeneric<
  Env extends string,
  Keys extends { [key: string]: any }
> = {
  [key in Env]: Keys;
};

// Program
export type Exec = (command: string) => ExecaChildProcess<string>;

// Typed Event Listener
export type Listener<T> = (event: T) => any;

export interface Disposable {
  dispose(): any;
}

/** passes through events as they happen. You will not get events from before you start listening */
export class TypedEvent<T> {
  private listeners: Listener<T>[] = [];
  private listenersOncer: Listener<T>[] = [];

  public on = (listener: Listener<T>): Disposable => {
    this.listeners.push(listener);
    return {
      dispose: () => this.off(listener),
    };
  };

  public once = (listener: Listener<T>): void => {
    this.listenersOncer.push(listener);
  };

  public off = (listener: Listener<T>) => {
    const callbackIndex = this.listeners.indexOf(listener);
    if (callbackIndex > -1) this.listeners.splice(callbackIndex, 1);
  };

  public emit = (event: T) => {
    /** Update any general listeners */
    this.listeners.forEach(listener => listener(event));

    /** Clear the `once` queue */
    if (this.listenersOncer.length > 0) {
      const toCall = this.listenersOncer;
      this.listenersOncer = [];
      toCall.forEach(listener => listener(event));
    }
  };

  public pipe = (te: TypedEvent<T>): Disposable => {
    return this.on(e => te.emit(e));
  };
}
