import fs from 'fs';
import path from 'path';
import { Logger } from '../Logger';

export function createFolderList(logger: Logger) {
  return function folderList(
    dir: string,
    filter?: RegExp,
    fileList: string[] = []
  ) {
    logger.debug(`finding in dir ${dir}`);
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const fileStat = fs.lstatSync(filePath);

      if (fileStat.isDirectory()) {
        folderList(filePath, filter, fileList);
      } else if (filter && filter.test(filePath)) {
        fileList.push(filePath);
      } else {
        fileList.push(filePath);
      }
    });

    logger.debug(`found ${files.length} files`);

    return fileList;
  };
}
