import execa from 'execa';

import type { Exec } from '../@types/program';
import type { Logger } from '../Logger';

export function createExec(logger: Logger): Exec {
  return (command: string) => {
    logger.debug(`Exec: "${command}"`);
    return execa.command(command);
  };
}
