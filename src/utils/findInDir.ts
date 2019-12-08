import fs from 'fs';
import path from 'path';
import { Logger } from '../Logger';

export function createFindInDir(logger: Logger) {
  return function findInDir(
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
        findInDir(filePath, filter, fileList);
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
