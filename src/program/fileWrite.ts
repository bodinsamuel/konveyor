import fs from 'fs';

import type { Logger } from '../Logger';

export function createFileWrite(logger: Logger) {
  return function (path: string, content: any): void {
    logger.debug(`Write file: "${path}"`);
    return fs.writeFileSync(path, content);
  };
}
