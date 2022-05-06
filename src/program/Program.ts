import type { Logger } from '../Logger';
import { ExitError } from '../errors';

import { createChoices } from './choices';
import { createExec } from './exec';
import { createFileRead } from './fileRead';
import { createFileWrite } from './fileWrite';
import { createFolderClear } from './folderClear';
import { createFolderList } from './folderList';
import { createParallelRun } from './parallelRun';
import { createRetryUntil } from './retryUntil';
import { createSpinner } from './spinner';
import type { Spinner } from './spinner';
import { createStreamSubProcess } from './streamTransform';
import { createYesNo } from './yesno';

export class Program {
  private _spinner?: Spinner;
  private _logger: Logger;

  constructor({ logger }: { logger: Logger }) {
    this._logger = logger;
  }

  get log(): Logger {
    return this._logger;
  }

  get spinner(): Spinner {
    if (!this._spinner) {
      this._spinner = createSpinner(this._logger);
    }

    return this._spinner;
  }

  get choices(): ReturnType<typeof createChoices> {
    return createChoices(this._logger);
  }

  get yesno(): ReturnType<typeof createYesNo> {
    return createYesNo(this._logger);
  }

  get folderClear(): ReturnType<typeof createFolderClear> {
    return createFolderClear(this._logger);
  }

  get folderList(): ReturnType<typeof createFolderList> {
    return createFolderList(this._logger);
  }

  get fileRead(): ReturnType<typeof createFileRead> {
    return createFileRead(this._logger);
  }

  get fileWrite(): ReturnType<typeof createFileWrite> {
    return createFileWrite(this._logger);
  }

  get exec(): ReturnType<typeof createExec> {
    return createExec(this._logger);
  }

  get execInteractive(): ReturnType<typeof createExec> {
    return createExec(this._logger, {
      stdio: 'inherit',
    });
  }

  get retryUntil(): ReturnType<typeof createRetryUntil> {
    return createRetryUntil(this._logger);
  }

  get parallelRun(): ReturnType<typeof createParallelRun> {
    return createParallelRun(this._logger);
  }

  get streamSubProcess(): ReturnType<typeof createStreamSubProcess> {
    return createStreamSubProcess(this._logger);
  }

  get exit(): () => void {
    return () => {
      throw new ExitError();
    };
  }
}
