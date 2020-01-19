import {
  createChoices,
  createExec,
  createFileRead,
  createFileWrite,
  createFolderClear,
  createFolderList,
  createStreamSubProcess,
  createYesNo,
  Spinner,
  createRetryUntil,
  createSpinner,
  createParallelRun,
} from './utils';
import { Logger } from './Logger';
import { ExitError } from './errors';

export class Program {
  private _spinner?: Spinner;
  private _logger: Logger;

  public constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
  }

  public get log() {
    return this._logger;
  }

  public get spinner() {
    if (!this._spinner) {
      this._spinner = createSpinner(this._logger);
    }

    return this._spinner;
  }

  public get choices() {
    return createChoices(this._logger);
  }

  public get yesno() {
    return createYesNo(this._logger);
  }

  public get folderClear() {
    return createFolderClear(this._logger);
  }

  public get folderList() {
    return createFolderList(this._logger);
  }

  public get fileRead() {
    return createFileRead(this._logger);
  }

  public get fileWrite() {
    return createFileWrite(this._logger);
  }

  public get exec() {
    return createExec(this._logger);
  }

  public get retryUntil() {
    return createRetryUntil(this._logger);
  }

  public get parallelRun() {
    return createParallelRun(this._logger);
  }

  public get streamSubProcess() {
    return createStreamSubProcess(this._logger);
  }

  public get exit() {
    return () => {
      throw new ExitError();
    };
  }
}
