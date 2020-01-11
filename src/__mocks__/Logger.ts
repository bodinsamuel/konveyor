export class Logger {
  public info() {}
  public error(err: Error) {
    throw err;
  }
  public warn() {}
  public debug() {}
  public help() {}
  public close() {}
}
