import { createLogger as createWinston, transports, format } from 'winston';

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

export function createLogger({ folder }: { folder: string }) {
  return createWinston({
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), formatConsole),
      }),
      new transports.File({
        filename: `${folder}/error.log`,
        level: 'error',
        format: formatFile,
      }),
      new transports.File({
        filename: `${folder}/debug.log`,
        level: 'debug',
        format: formatFile,
      }),
    ],
  });
}
