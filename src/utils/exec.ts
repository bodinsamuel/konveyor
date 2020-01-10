import execa = require('execa');

import { Exec } from '../types';
import { Logger } from '../Logger';

export function createExec(logger: Logger): Exec {
  return (command: string) => {
    logger.debug(`Exec: "${command}"`);
    return execa.command(command);
  };
}
