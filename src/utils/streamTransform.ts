import { Transform } from 'stream';
import { ChildProcess } from 'child_process';
import { Logger } from '../Logger';

export class StreamTransform extends Transform {
  private level: string;

  public constructor({ level }: { level: string } = { level: 'info' }) {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    });
    this.level = level;
  }

  public _transform(chunk: any, _encoding: string, callback: any) {
    this.push({
      level: this.level,
      message: chunk,
    });

    callback();
  }
}

export function createStreamSubProcess(logger: Logger) {
  return (subprocess: ChildProcess, level: string = 'debug') => {
    return new Promise(resolve => {
      const stream = new StreamTransform({ level });
      subprocess.stdout!.pipe(stream).pipe(logger.winston, {
        end: false,
      });

      subprocess.stderr!.on('data', err => {
        throw new Error(err);
      });

      subprocess.on('close', (code: number) => {
        if (code <= 0) {
          resolve();
        }
      });
    });
  };
}
