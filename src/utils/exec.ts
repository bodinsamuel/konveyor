import type { spawn } from 'child_process';

import type { Options } from 'execa';
import execa from 'execa';

import type { Logger } from '../Logger';

export type Exec = ReturnType<typeof createExec>;
type ExecPromise = { cmd: ReturnType<typeof spawn>; output: string[] };

export function createExec(
  logger: Logger,
  defaultOptions?: Options
): (
  command: string,
  options?: Options
) => {
  promise: Promise<ExecPromise>;
  cmd: ReturnType<typeof spawn>;
} {
  return (command: string, options?: Options) => {
    logger.debug(`> exec() "${command}"`);

    const cmd = execa.command(command, {
      stdio: [0, undefined, undefined],
      // ...defaultOptions,
      // ...options,
    });

    const output: string[] = [];

    const promise = new Promise<ExecPromise>((resolve) => {
      // const cmd = execa.command(command, {
      //   ...defaultOptions,
      //   ...options,
      //   stdio: [0, undefined, undefined],
      // });
      // console.log('Nsdfs');

      // if (cmd.stdout) {
      //   console.log('NIQUE TA GRADN');
      //   cmd.stdout.on('data', (s) => console.log('d', s));
      //   cmd.stdout.pipe(process.stdout);
      // }
      // if (cmd.stdin) {
      //   cmd.stdin.pipe(process.stdout);

      //   cmd.stdin.on('data', (s) => console.log('d', s));
      // }

      cmd.stdout?.on('data', (data: any) => {
        logger.debug(data);
        output.push(data.toString());
      });
      cmd.stderr?.on('data', (data: any) => {
        logger.info('prea');
        logger.info(data);
        output.push(data.toString());
      });
      cmd.stdout?.on('end', () => {
        // cmd.stdout?.removeAllListeners();
        // cmd.stderr?.removeAllListeners();
      });
      cmd.on('exit', (code, signal) => {
        logger.debug(`exit ${code} ${signal}`);
        if (code === 0) {
          resolve({ cmd, output });
        } else {
          resolve({ cmd, output });
        }
        logger.debug('< end');
      });
    });

    return { cmd, promise };
  };
}
