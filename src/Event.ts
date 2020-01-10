import { EventEmitter } from 'events';

const events = new EventEmitter();
export class Event {
  public on(name: string, listener: (...args: any[]) => void) {
    events.on(name, listener);
  }

  public off(name: string, listener: (...args: any[]) => void) {
    events.off(name, listener);
  }

  public emit(name: string, ...args: any[]) {
    events.emit(name, args);
  }
}
