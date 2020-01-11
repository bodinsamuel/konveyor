import { EventEmitter } from 'events';

const events = new EventEmitter();

export class Event<T extends string> {
  public on(name: T, listener: (...args: any[]) => void) {
    events.on(name, listener);
  }

  public once(name: T, listener: (...args: any[]) => void) {
    events.once(name, listener);
  }

  public off(name: T, listener: (...args: any[]) => void) {
    events.off(name, listener);
  }

  public emit(name: T, ...args: any[]) {
    events.emit(name, args);
  }
}
