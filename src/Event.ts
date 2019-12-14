import { EventEmitter } from 'events';

const events = new EventEmitter();
export class Event {
  on(name: string, listener: (...args: any[]) => void) {
    events.on(name, listener);
  }

  off(name: string, listener: (...args: any[]) => void) {
    events.off(name, listener);
  }

  emit(name: string, ...args: any[]) {
    events.emit(name, args);
  }
}
