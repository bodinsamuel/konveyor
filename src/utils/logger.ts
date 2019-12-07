import { createLogger, transports, format } from 'winston';

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

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), formatConsole),
    }),
    new transports.File({
      filename: 'error.log',
      level: 'error',
      format: formatFile,
    }),
    new transports.File({
      filename: 'index.log',
      level: 'debug',
      format: formatFile,
    }),
  ],
});
