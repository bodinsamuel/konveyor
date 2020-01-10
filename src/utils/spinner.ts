// Stolen from vue-cli
import ora from 'ora';

export class Spinner {
  private spinner: ora.Ora;
  private lastMsg: string | null = null;

  public constructor() {
    this.spinner = ora();
  }

  public spin(msg: string) {
    this.lastMsg = msg;
    this.spinner.start(msg);
  }

  public stop(persist: boolean = true) {
    if (this.lastMsg && persist !== false) {
      this.spinner.stopAndPersist();
    } else {
      this.spinner.stop();
    }
    this.lastMsg = null;
  }

  public clear() {
    this.spinner.clear();
    this.lastMsg = null;
  }

  public info(text?: string) {
    this.spinner.info(text);
    this.lastMsg = null;
  }

  public succeed(text?: string) {
    this.spinner.succeed(text);
    this.lastMsg = null;
  }

  public fail(text?: string) {
    if (!this.lastMsg) return;
    this.spinner.fail(text);
    this.lastMsg = null;
  }
}
