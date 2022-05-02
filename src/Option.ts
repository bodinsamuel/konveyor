import type { TypeBase } from 'altheia-async-data-validator';

import type { ValidationOption } from './@types/parser';

export class Option {
  #long;
  #short;
  #withValues: boolean;
  #aliases: string[] = [];
  #msg: string | undefined;
  #val: TypeBase | undefined;

  constructor(long: string, short?: string) {
    this.#long = long;
    this.#short = short;
    this.#withValues = false;

    if (this.#short) {
      this.#aliases.push(this.#short);
    }
  }

  get validation(): ValidationOption {
    return {
      name: this.#long,
      aliases: this.#aliases,
      withValue: this.#withValues,
    };
  }

  msg(msg: string): this {
    this.#msg = msg;
    return this;
  }

  alias(alias: string): this {
    this.#aliases.push(alias);
    return this;
  }

  valueValidation(val: TypeBase): this {
    this.#withValues = true;
    this.#val = val;
    return this;
  }
}
