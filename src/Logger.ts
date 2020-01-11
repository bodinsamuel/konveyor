import {
  createLogger as createWinston,
  transports,
  format,
  Logger as WinstonLogger,
} from 'winston';
import chalk from 'chalk';
import figures from 'figures';

const formatConsole = format.printf(({ level, message }) => {
  if (level.indexOf('info') < 0) {
    return `${level} ${message}`;
  }
  return message;
});

const formatFile = format.printf(({ level, message }) => {
  if (level.indexOf('error') >= 0) {
    return `${level} ${message}`;
  }
  return message;
});

export class Logger {
  public readonly winston: WinstonLogger;

  public constructor({ folder }: { folder: string }) {
    this.winston = createWinston({
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), formatConsole),
        }),
        new transports.File({
          filename: `${folder}/debug.log`,
          level: 'debug',
          format: format.combine(formatFile, format.uncolorize()),
          options: { flags: 'w' },
        }),
      ],
    });
  }

  public info(msg: string) {
    this.winston.info(msg);
  }

  public error(msg: string | Error) {
    if (typeof msg === 'object') {
      this.winston.debug(msg.stack as string);
      this.winston.error(msg.message);
    } else {
      this.winston.error(msg);
    }
  }

  public warn(msg: string) {
    this.winston.warn(msg);
  }

  public debug(msg: string) {
    this.winston.debug(msg);
  }

  public help(msg: string, command?: string) {
    this.info(`${chalk.blue(figures.info)} ${msg}:`);
    this.info(`   ${figures.pointerSmall} ${command && chalk.dim(command)}`);
    this.info('\r');
  }

  public async close() {
    await Promise.all([
      new Promise(resolve => {
        this.winston.on('finish', () => {
          resolve();
        });
        this.winston.end();
      }),
      // Wait at least 1s anyway
      new Promise(resolve => {
        setTimeout(resolve, 1000);
      }),
    ]);
  }
}
