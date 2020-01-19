export class Logger {
  public info = jest.fn();
  public error(err: Error) {
    throw err;
  }
  public warn = jest.fn();
  public debug = jest.fn();
  public help = jest.fn();
  public close = jest.fn();
}
