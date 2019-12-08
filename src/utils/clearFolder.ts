import rimraf from 'rimraf';
import { Logger } from '../Logger';

export function createClearFolder(logger: Logger) {
  return async function clearFolder(path: string) {
    await new Promise((resolve, reject) => {
      rimraf(path, error => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    logger.debug(`rimraf: ${path}`);
  };
}
