export class Logger {
  info = jest.fn();
  error(err: Error) {
    throw err;
  }
  warn = jest.fn();
  debug = jest.fn();
  help = jest.fn();
  close = jest.fn();
}
