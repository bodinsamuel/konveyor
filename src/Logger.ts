import {
  createLogger as createWinston,
  transports,
  format,
  Logger as WinstonLogger,
} from 'winston';
import chalk = require('chalk');
import figures = require('figures');

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
  readonly winston: WinstonLogger;

  constructor({ folder }: { folder: string }) {
    this.winston = createWinston({
      transports: [
        new transports.Console({
          format: format.combine(format.colorize(), formatConsole),
        }),
        new transports.File({
          filename: `${folder}/debug.log`,
          level: 'debug',
          format: formatFile,
        }),
      ],
    });
  }

  info(msg: string) {
    this.winston.info(msg);
  }

  error(msg: string | Error) {
    if (typeof msg === 'object') {
      this.winston.debug(msg.stack as string);
      this.winston.error(msg.message);
    } else {
      this.winston.error(msg);
    }
  }

  warn(msg: string) {
    this.winston.warn(msg);
  }

  debug(msg: string) {
    this.winston.debug(msg);
  }

  help(msg: string, command?: string) {
    this.info('\r');

    this.info(
      `${chalk.blue(figures.info)} ${msg} ${command && chalk.dim(command)}`
    );
    this.info('\r');
  }
}
