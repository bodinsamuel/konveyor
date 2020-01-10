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

  get yesno() {
    return creatYesNo(this._logger);
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

  get tryUntil() {
    return tryUntil;
  }

  get streamSubProcess() {
    return createStreamSubProcess(this._logger);
  }

  exit = async (code: number = 1) => {
    this.spinner.fail();

    this.log.debug('---- Konveyor Exit');
    await this.log.close();

    process.exit(code);
  };
}
