import { ChildProcess } from 'child_process';
import execa = require('execa');

import {
  createChoices,
  Spinner,
  StreamTransform,
  tryUntil,
  createFolderList,
  createFolderClear,
} from './utils';
import { Logger } from './Logger';

export class Program {
  readonly _spinner: Spinner;
  readonly _logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this._spinner = new Spinner();
    this._logger = logger;
  }

  get log() {
    return this._logger;
  }

  get spinner() {
    return this._spinner;
  }

  get choices() {
    return createChoices(this._logger);
  }

  get folderClear() {
    return createFolderClear(this._logger);
  }

  get folderList() {
    return createFolderList(this._logger);
  }

  get exec() {
    return execa;
  }

  get tryUntil() {
    return tryUntil;
  }

  streamSubProcess = async (
    subprocess: ChildProcess,
    level: string = 'debug'
  ) => {
    return new Promise(resolve => {
      const stream = new StreamTransform({ level });
      subprocess.stdout!.pipe(stream).pipe(this.log.winston, {
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

  exit = async (code: number = 1) => {
    this.spinner.fail();

    await new Promise(resolve => {
      this.log.winston.on('finish', () => {
        resolve();
      });
      this.log.winston.end();
    });

    process.exit(code);
  };
}
