// Stolen from vue-cli
import ora from 'ora';
import { Logger } from '../Logger';

export class Spinner {
  private spinner: ora.Ora;
  private lastMsg: string | null = null;
  private logger: Logger;

  public constructor(logger: Logger) {
    this.spinner = ora();
    this.logger = logger;
  }

  public spin(msg: string) {
    this.lastMsg = msg;
    this.spinner.start(msg);
    this.logger.debug(`[Spinner] start: ${msg}`);
  }

  public stop(persist: boolean = true) {
    if (this.lastMsg && persist !== false) {
      this.spinner.stopAndPersist();
    } else {
      this.spinner.stop();
    }

    this.logger.debug(`[Spinner] stop`);
    this.lastMsg = null;
  }

  public clear() {
    this.spinner.clear();
    this.lastMsg = null;
  }

  public info(text?: string) {
    this.spinner.info(text);
    this.logger.debug(`[Spinner] info: ${text}`);
    this.lastMsg = null;
  }

  public succeed(text?: string) {
    this.spinner.succeed(text);
    this.logger.debug(`[Spinner] succeed: ${text}`);
    this.lastMsg = null;
  }

  public fail(text?: string) {
    if (!this.lastMsg) {
      return;
    }

    this.spinner.fail(text);
    this.logger.debug(`[Spinner] fail: ${text || ''}`);
    this.lastMsg = null;
  }
}

export function createSpinner(logger: Logger) {
  return new Spinner(logger);
}
