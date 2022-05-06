import type { Stats } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import type { AutoloadConfig, DirMapping } from '../@types/parser';
import { Command } from '../Command';
import type { Logger } from '../Logger';
import { InvalidDirectory, NotADirectory } from '../errors';

const ALLOWED_EXTS = ['.ts', '.js', '.sh'];
const EXECUTABLE = ['.sh'];

export async function loadCommandsFromFs({
  config,
  dirPath,
  prevPaths,
  log,
}: {
  config: AutoloadConfig;
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

    if (config.allow && !config.allow.test(load)) {
      log.debug(`Not allowed "${load}"`);
      continue;
    }
    if (config.ignore?.test(load)) {
      log.debug(`Ignored "${load}"`);
      continue;
    }

    if (file.isDirectory()) {
      res.subs.push(
        await loadCommandsFromFs({
          dirPath: load,
          config,
          prevPaths: res.paths,
          log,
        })
      );
      continue;
    }

    const ext = path.extname(file.name);
    if (!ALLOWED_EXTS.includes(ext)) {
      log.debug(`Skipped "${load}"`);
      continue;
    }

    const name = path.basename(file.name, path.extname(file.name));
    if (name === 'index') {
      res.isTopic = false;
    }

    let cmd: Command<any>;
    if (EXECUTABLE.includes(ext)) {
      cmd = new Command({
        name,
        async exec({ exec }): Promise<void> {
          await exec(load).promise;
        },
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const imp = require(load);
      if (typeof imp.default === 'undefined') {
        throw new Error(`File "${load}" does not export a 'default' prop`);
      }
      if (!imp.default.__Command) {
        throw new Error(
          `File "${load}" does not export a valid Command [${imp.default.constructor.name}]`
        );
      }
      cmd = imp.default;
    }

    res.cmds.push({
      paths: [...res.paths, name],
      cmd,
    });
    log.debug(`Found "${load}"`);
  }

  return res;
}
