import fs from 'fs';
import path from 'path';

import type { Logger } from '../Logger';

export function createFolderList(logger: Logger) {
  return function folderList(
    dir: string,
    filter?: RegExp,
    fileList: string[] = [],
    initial: boolean = true
  ): string[] {
    if (initial) {
      logger.debug(`Listing dir: "${dir}"`);
    }
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const fileStat = fs.lstatSync(filePath);

      if (fileStat.isDirectory()) {
        folderList(filePath, filter, fileList, false);
      } else if (filter?.test(filePath)) {
        fileList.push(filePath);
      } else {
        fileList.push(filePath);
      }
    });

    if (initial) {
      logger.debug(`Found: ${fileList.length} files`);
    }

    return fileList;
  };
}
