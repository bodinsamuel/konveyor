import execa = require('execa');

import { createChoices } from './utils/choices';
import { Spinner } from './utils/spinner';
import { Logger, createClearFolder, createFindInDir } from './utils';

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

  // get store() {
  //   return this.store;
  // }

  get spinner() {
    return this._spinner;
  }

  get choices() {
    return createChoices(this._logger);
  }

  get clearFolder() {
    return createClearFolder(this._logger);
  }

  get findInDir() {
    return createFindInDir(this._logger);
  }

  get exec() {
    return execa;
  }

  async exit(code: number = 1) {
    this.spinner.fail();

    await new Promise(resolve => {
      this.log.winston.on('finish', () => {
        resolve();
      });
      this.log.winston.end();
    });

    process.exit(code);
  }
}
