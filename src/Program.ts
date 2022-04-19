import type { Logger } from './Logger';
import { ExitError } from './errors';
import type { Spinner } from './utils';
import {
  createChoices,
  createExec,
  createFileRead,
  createFileWrite,
  createFolderClear,
  createFolderList,
  createStreamSubProcess,
  createYesNo,
  createRetryUntil,
  createSpinner,
  createParallelRun,
} from './utils';

export class Program {
  private _spinner?: Spinner;
  private _logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
  }

  get log() {
    return this._logger;
  }

  get spinner() {
    if (!this._spinner) {
      this._spinner = createSpinner(this._logger);
    }

    return this._spinner;
  }

  get choices() {
    return createChoices(this._logger);
  }

  get yesno() {
    return createYesNo(this._logger);
  }

  get folderClear() {
    return createFolderClear(this._logger);
  }

  get folderList() {
    return createFolderList(this._logger);
  }

  get fileRead() {
    return createFileRead(this._logger);
  }

  get fileWrite() {
    return createFileWrite(this._logger);
  }

  get exec() {
    return createExec(this._logger);
  }

  get retryUntil() {
    return createRetryUntil(this._logger);
  }

  get parallelRun() {
    return createParallelRun(this._logger);
  }

  get streamSubProcess() {
    return createStreamSubProcess(this._logger);
  }

  get exit() {
    return () => {
      throw new ExitError();
    };
  }
}
