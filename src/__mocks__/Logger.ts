export class Logger {
  content: string[][] = [];
  info = jest.fn((...args: string[]) => {
    this.content.push(args);
  });
  warn = jest.fn((...args: string[]) => {
    this.content.push(args);
  });
  debug = jest.fn((...args: string[]) => {
    this.content.push(args);
  });
  help = jest.fn((...args: string[]) => {
    this.content.push(args);
  });
  close = jest.fn((...args: string[]) => {
    this.content.push(args);
  });
  error = jest.fn((...args: string[]) => {
    this.content.push(args);
  });
}
