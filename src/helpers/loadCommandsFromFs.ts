import type { Stats } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import type { Command } from '../Command';
import type { Logger } from '../Logger';
import { InvalidDirectory, NotADirectory } from '../errors';

export interface DirMapping {
  dirPath: string;
  paths: string[];
  cmds: {
    paths: string[];
    isTopic: boolean;
    basename: string;
    cmd: Command<any>;
  }[];
}

export async function loadCommandsFromFs({
  dirPath,
  prevPaths,
  log,
}: {
  dirPath: string;
  prevPaths?: string[];
  log: Logger;
}): Promise<DirMapping[]> {
  const res: DirMapping[] = [
    { dirPath, paths: [...(prevPaths || [])], cmds: [] },
  ];
  log.debug(`Autoload commands from path "${dirPath}"`);

  let stat: Stats | undefined;
  try {
    stat = await fs.stat(dirPath);
  } catch (err) {
    throw new InvalidDirectory(dirPath);
  }

  if (!stat.isDirectory()) {
    throw new NotADirectory(dirPath);
  }

  const dir = await fs.readdir(dirPath, {
    withFileTypes: true,
  });

  const basename = path.basename(dirPath);
  const paths = prevPaths ? [...prevPaths, basename] : [];
  let isTopic = Boolean(prevPaths);

  for (const file of dir) {
    const load = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      res.push(
        ...(await loadCommandsFromFs({ dirPath: load, prevPaths: paths, log }))
      );
      continue;
    }

    const name = path.basename(file.name, path.extname(file.name));
    if (name === 'index') {
      isTopic = false;
    }
    res[0].cmds.push({
      basename: name,
      paths: [...paths, name],
      isTopic,
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      cmd: require(load).default,
    });
    log.debug(`Found "${load}"`);
  }

  return res;
}
