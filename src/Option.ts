import type { TypeBase } from 'altheia-async-data-validator';

export class Option {
  #long;
  #short;
  #msg: string | undefined;
  #val: TypeBase | undefined;

  constructor(long: string, short?: string) {
    this.#long = long;
    this.#short = short;
  }

  msg(msg: string): this {
    this.#msg = msg;
    return this;
  }

  validation(val: TypeBase): this {
    this.#val = val;
    return this;
  }
}
