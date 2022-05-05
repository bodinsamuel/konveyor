import { format } from 'logform';
import type { LogEntry } from 'winston';
import Transport from 'winston-transport';

import type { ParsedArgv } from '../@types/parser';
import { Logger } from '../Logger';
import { parseArgv } from '../parser/parseArgv';

class TestTransporter extends Transport {
  content: string[] = [];
  log(info: LogEntry, callback?: any): void {
    this.content.push(info.message);
    if (callback) callback();
  }
}

export function nodeJsArgv(args: string[]): string[] {
  return ['node', 'index.js', ...args];
}

export function argv(args: string[]): ParsedArgv['flat'] {
  return parseArgv(nodeJsArgv(args)).flat;
}

export function getLogger(): { stream: string[]; logger: Logger } {
  const cls = new TestTransporter();
  return {
    stream: cls.content,
    logger: new Logger(
      {
        logToConsole: false,
      },
      {
        format: format.uncolorize(),
        transports: [cls],
        level: 'debug',
      }
    ),
  };
}
