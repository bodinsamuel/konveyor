import fs from 'fs';

import { Logger } from '../Logger';

export function createFileWrite(logger: Logger) {
  return function(path: string, content: any) {
    logger.debug(`Write file: "${path}"`);
    return fs.writeFileSync(path, content);
  };
}
