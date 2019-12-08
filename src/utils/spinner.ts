// Stolen from vue-cli
import ora from 'ora';

export class Spinner {
  private spinner: ora.Ora;
  private lastMsg: string | null = null;

  constructor() {
    this.spinner = ora();
  }

  spin(msg: string) {
    this.lastMsg = msg;
    this.spinner.start(msg);
  }

  stop(persist: boolean = true) {
    if (this.lastMsg && persist !== false) {
      this.spinner.stopAndPersist();
    } else {
      this.spinner.stop();
    }
    this.lastMsg = null;
  }

  clear() {
    this.spinner.clear();
    this.lastMsg = null;
  }

  info(text?: string) {
    this.spinner.info(text);
    this.lastMsg = null;
  }

  succeed(text?: string) {
    this.spinner.succeed(text);
    this.lastMsg = null;
  }

  fail(text?: string) {
    this.spinner.fail(text);
    this.lastMsg = null;
  }
}
