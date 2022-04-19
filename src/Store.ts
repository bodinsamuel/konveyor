import type { StoreGeneric } from './types';

export class Store<Env extends string, Keys extends { [key: string]: any }> {
  // @ts-expect-error
  private kv: StoreGeneric<Env, Keys> = {};
  private env: Env;

  constructor(env: Env, keyValues?: StoreGeneric<Env, Keys>) {
    if (keyValues) {
      this.kv = keyValues;
    }

    this.env = env;
  }

  is(env: Env) {
    return this.env === env;
  }

  switch(env: Env) {
    this.env = env;
  }

  set(key: keyof Keys, value: any) {
    this.kv[this.env][key] = value;
  }

  get<A extends keyof Keys>(key: A): Keys[A] {
    if (typeof this.kv[this.env][key] === 'undefined') {
      throw new Error(`Store: key "${key}" does not exists`);
    }

    return this.kv[this.env][key];
  }

  toJson() {
    return this.kv[this.env];
  }
}
