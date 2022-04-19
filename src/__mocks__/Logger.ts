export class Logger {
  info = jest.fn();
  warn = jest.fn();
  debug = jest.fn();
  help = jest.fn();
  close = jest.fn();
  error(err: Error): void {
    throw err;
  }
}
