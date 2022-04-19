import execa = require('execa');

import type { Logger } from '../Logger';
import type { Exec } from '../types';

export function createExec(logger: Logger): Exec {
  return (command: string) => {
    logger.debug(`Exec: "${command}"`);
    return execa.command(command);
  };
}
