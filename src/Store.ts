import type { StoreGeneric } from './types';

export class Store<TEnv extends string, TKeys extends { [key: string]: any }> {
  // @ts-expect-error
  private kv: StoreGeneric<TEnv, Keys> = {};
  private env: TEnv;

  constructor(env: TEnv, keyValues?: StoreGeneric<TEnv, TKeys>) {
    if (keyValues) {
      this.kv = keyValues;
    }

    this.env = env;
  }

  is(env: TEnv): boolean {
    return this.env === env;
  }

  switch(env: TEnv): void {
    this.env = env;
  }

  set(key: keyof TKeys, value: any): void {
    this.kv[this.env][key] = value;
  }

  get<TKey extends keyof TKeys>(key: TKey): TKeys[TKey] {
    if (typeof this.kv[this.env][key] === 'undefined') {
      throw new Error(`Store: key "${key}" does not exists`);
    }

    return this.kv[this.env][key];
  }

  toJson(): StoreGeneric<TEnv, TKeys> {
    return this.kv[this.env];
  }
}
