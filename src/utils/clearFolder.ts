import rimraf from 'rimraf';
import { Program } from '../Program';

export async function clearFolder(prgm: Program, path: string) {
  await new Promise((resolve, reject) => {
    rimraf(path, error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  prgm.debug(`rimraf: ${path}`);
}
