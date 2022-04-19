import { EventEmitter } from 'events';

const events = new EventEmitter();

export class Event<T extends string> {
  on(name: T, listener: (...args: any[]) => void) {
    events.on(name, listener);
  }

  once(name: T, listener: (...args: any[]) => void) {
    events.once(name, listener);
  }

  off(name: T, listener: (...args: any[]) => void) {
    events.off(name, listener);
  }

  emit(name: T, ...args: any[]) {
    events.emit(name, args);
  }
}
