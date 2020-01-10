import {
  createChoices,
  createExec,
  createFileRead,
  createFileWrite,
  createFolderClear,
  createFolderList,
  createStreamSubProcess,
  creatYesNo,
  Spinner,
  tryUntil,
} from './utils';

import { Logger } from './Logger';

export class Program {
  public readonly _spinner: Spinner;
  public readonly _logger: Logger;

  public constructor({ logger }: { logger: Logger }) {
    this._spinner = new Spinner();
    this._logger = logger;
  }

  public get log() {
    return this._logger;
  }

  public get spinner() {
    return this._spinner;
  }

  public get choices() {
    return createChoices(this._logger);
  }

  public get yesno() {
    return creatYesNo(this._logger);
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

  public get tryUntil() {
    return tryUntil;
  }

  public get streamSubProcess() {
    return createStreamSubProcess(this._logger);
  }

  public exit = async (code: number = 1) => {
    this.spinner.fail();

    this.log.debug('---- Konveyor Exit');
    await this.log.close();

    // eslint-disable-next-line no-process-exit
    process.exit(code);
  };
}
