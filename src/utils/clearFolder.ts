import rimraf from 'rimraf';
import { Konveyor } from '../Konveyor';

export async function clearFolder(prgm: Konveyor, path: string) {
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
