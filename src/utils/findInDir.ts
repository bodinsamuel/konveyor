import fs from 'fs';
import path from 'path';

export function findInDir(
  dir: string,
  filter?: RegExp,
  fileList: string[] = []
) {
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

  return fileList;
}
