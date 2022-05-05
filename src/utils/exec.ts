import type { spawn } from 'child_process';

import type { Options } from 'execa';
import execa from 'execa';

import type { Logger } from '../Logger';

export type Exec = ReturnType<typeof createExec>;
type ExecPromise = {
  cmd: ReturnType<typeof spawn>;
  output: string[];
  errors: string[];
};

export function createExec(
  logger: Logger,
  _defaultOptions?: Options
): (
  command: string,
  options?: Options
) => {
  promise: Promise<ExecPromise>;
  cmd: ReturnType<typeof spawn>;
} {
  return (command: string, _options?: Options) => {
    logger.debug(`> exec() "${command}"`);

    const cmd = execa.command(command, {
      stdio: [0, undefined, undefined],
      // ...defaultOptions,
      // ...options,
    });

    const output: string[] = [];
    const errors: string[] = [];

    const promise = new Promise<ExecPromise>((resolve) => {
      cmd.stdout?.on('data', (data: any) => {
        logger.debug(data);
        output.push(data.toString());
      });

      cmd.stderr?.on('data', (data: any) => {
        const str = data.toString();
        logger.debug(str);
        output.push(str);
        errors.push(str);
      });

      cmd.on('exit', (code, signal) => {
        logger.debug(`exit ${code} ${signal}`);
        if (code === 0) {
          resolve({ cmd, output, errors });
        } else {
          resolve({ cmd, output, errors });
        }
        logger.debug('< end');
      });
    });

    return { cmd, promise };
  };
}
