import { createLogger, transports, format } from 'winston';

const myFormat = format.printf(({ level, message }) => {
  if (level.indexOf('info') < 0) {
    return `${level}: ${message}`;
  }
  return message;
});

export const logger = createLogger({
  format: format.combine(format.colorize(), myFormat),
  transports: [new transports.Console()],
});
