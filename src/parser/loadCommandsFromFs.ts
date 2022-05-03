import type { Stats } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import type { Command } from '../Command';
import type { Logger } from '../Logger';
import { InvalidDirectory, NotADirectory } from '../errors';

export interface DirMapping {
  dirPath: string;
  paths: string[];
  isTopic: boolean;
  subs: DirMapping[];
  cmds: {
    paths: string[];
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
}): Promise<DirMapping> {
  log.debug(`Autoload commands from path "${dirPath}"`);

  const basename = path.basename(dirPath);
  const res: DirMapping = {
    dirPath,
    paths: [...(prevPaths || [])],
    isTopic: Boolean(prevPaths),
    subs: [],
    cmds: [],
  };
  if (prevPaths) {
    res.paths.push(basename);
  }

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

  for (const file of dir) {
    const load = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      res.subs.push(
        await loadCommandsFromFs({
          dirPath: load,
          prevPaths: res.paths,
          log,
        })
      );
      continue;
    }

    const name = path.basename(file.name, path.extname(file.name));
    if (name === 'index') {
      res.isTopic = false;
    }
    res.cmds.push({
      basename: name,
      paths: [...res.paths, name],
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      cmd: require(load).default,
    });
    log.debug(`Found "${load}"`);
  }

  return res;
}
