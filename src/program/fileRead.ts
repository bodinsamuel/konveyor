import fs from 'fs';

import type { Logger } from '../Logger';

export function createFileRead(logger: Logger) {
  return function (path: string): Buffer {
    logger.debug(`Read file: "${path}"`);
    return fs.readFileSync(path);
  };
}
