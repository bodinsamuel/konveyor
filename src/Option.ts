import type { TypeBase } from 'altheia-async-data-validator';

import type { Callback } from './@types/command';

export class Option {
  #long;
  #short;
  #withValues: boolean = false;
  #aliases: string[] = [];
  #exec: Callback<any> | undefined;
  #msg: string | undefined;
  #val: TypeBase | undefined;
  #global: boolean = false;

  constructor(long: string, short?: string) {
    this.#long = long;
    this.#short = short;
    this.#withValues = false;

    if (this.#short) {
      this.#aliases.push(this.#short);
    }
  }

  get [Symbol.toStringTag](): string {
    return `${this.#long}`;
  }

  get isGlobal(): boolean {
    return this.#global;
  }

  get name(): string {
    return this.#long;
  }

  get expectValue(): boolean {
    return this.#withValues;
  }

  toJSON(): {
    name: string;
    global: boolean;
    withValue?: boolean;
    aliases?: string[];
    msg?: string;
  } {
    return {
      name: this.#long,
      aliases: this.#aliases,
      withValue: this.#withValues,
      msg: this.#msg,
      global: this.#global,
    };
  }

  msg(msg: string): this {
    this.#msg = msg;
    return this;
  }

  alias(...alias: string[]): this {
    this.#aliases.push(...alias);
    return this;
  }

  value(): this {
    this.#withValues = true;
    return this;
  }

  valueValidation(val: TypeBase): this {
    this.#withValues = true;
    this.#val = val;
    return this;
  }

  exec(exec: Callback<any>): this {
    this.#exec = exec;
    return this;
  }

  global(): this {
    this.#global = true;
    return this;
  }

  is(name: string): boolean {
    return (
      this.#long === name ||
      this.#aliases.find((alias) => alias === name) !== undefined
    );
  }
}
