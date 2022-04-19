import rimraf from 'rimraf';

import type { Logger } from '../Logger';

export function createFolderClear(logger: Logger) {
  return async function folderClear(path: string): Promise<void> {
    logger.debug(`Clearing folder: "${path}"`);

    await new Promise((resolve, reject) => {
      rimraf(path, (error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });
    });

    logger.debug(`Folder cleared`);
  };
}
