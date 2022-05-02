import type { Stats } from 'fs';
import fs from 'fs/promises';
import path from 'path';

import type { Logger } from '../Logger';
import type { Task } from '../Task';
import { InvalidDirectory, NotADirectory } from '../errors';

export async function loadTasksFromPath({
  dirPath,
  log,
}: {
  dirPath: string;
  log: Logger;
}): Promise<Task<any>[]> {
  log.debug(`Autoload tasks from path ${dirPath}`);

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

  const tasks: Task<any>[] = [];
  for (const file of dir) {
    if (file.isDirectory()) {
      continue;
    }

    const load = path.join(dirPath, file.name);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    tasks.push(require(load).default);
    log.debug(`Found ${load}`);
  }

  log.debug(`Found ${tasks.length}`);
  return tasks;
}
