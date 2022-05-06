// Stolen from vue-cli
import type { Ora } from 'ora';
import oraFactory from 'ora';

import type { Logger } from '../Logger';

export class Spinner {
  private spinner: Ora;
  private lastMsg: string | null = null;
  private logger: Logger;

  constructor({ logger, ora }: { logger: Logger; ora?: Ora }) {
    this.spinner = ora || oraFactory();
    this.logger = logger;
  }

  spin(msg: string): void {
    this.lastMsg = msg;
    this.spinner.start(msg);
    this.logger.debug(`[Spinner] start: ${msg}`);
  }

  stop(persist: boolean = true): void {
    if (this.lastMsg && persist !== false) {
      this.spinner.stopAndPersist();
    } else {
      this.spinner.stop();
    }

    this.logger.debug(`[Spinner] stop`);
    this.lastMsg = null;
  }

  clear(): void {
    this.spinner.clear();
    this.lastMsg = null;
  }

  info(text?: string): void {
    this.spinner.info(text);
    this.logger.debug(`[Spinner] info: ${text}`);
    this.lastMsg = null;
  }

  succeed(text?: string): void {
    this.spinner.succeed(text);
    this.logger.debug(`[Spinner] succeed: ${text}`);
    this.lastMsg = null;
  }

  fail(text?: string): void {
    if (!this.lastMsg) {
      return;
    }

    this.spinner.fail(text);
    this.logger.debug(`[Spinner] fail: ${text || ''}`);
    this.lastMsg = null;
  }
}

export function createSpinner(logger: Logger): Spinner {
  return new Spinner({ logger });
}
