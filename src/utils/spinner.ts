// Stolen from vue-cli
import ora from 'ora';
import chalk from 'chalk';

export class Spinner {
  private spinner: ora.Ora;
  private lastMsg: { symbol: string; text: string } | null = null;
  private isPaused = false;

  constructor() {
    this.spinner = ora();
  }

  log(symbol: string, msg?: string) {
    if (!msg) {
      msg = symbol;
      symbol = chalk.green('✔');
    }
    if (this.lastMsg) {
      this.spinner.stopAndPersist({
        symbol: this.lastMsg.symbol,
        text: this.lastMsg.text,
      });
    }
    this.spinner.text = ' ' + msg;
    this.lastMsg = {
      symbol: symbol + ' ',
      text: msg,
    };
    this.spinner.start();
  }

  stop(persist: boolean = true) {
    if (this.lastMsg && persist !== false) {
      this.spinner.stopAndPersist({
        symbol: this.lastMsg.symbol,
        text: this.lastMsg.text,
      });
    } else {
      this.spinner.stop();
    }
    this.lastMsg = null;
  }

  pause() {
    if (this.spinner.isSpinning) {
      this.spinner.stop();
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.spinner.start();
      this.isPaused = false;
    }
  }

  fail(text?: string) {
    this.spinner.fail(text || (this.lastMsg ? this.lastMsg.text : 'unknown'));
    this.lastMsg = null;
  }
}
