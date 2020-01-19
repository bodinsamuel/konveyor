import rimraf from 'rimraf';
import { Logger } from '../Logger';

export function createFolderClear(logger: Logger) {
  return async function folderClear(path: string) {
    logger.debug(`Clearing folder: "${path}"`);

    await new Promise((resolve, reject) => {
      rimraf(path, error => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    logger.debug(`Folder cleared`);
  };
}
