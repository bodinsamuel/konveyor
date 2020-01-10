import { StoreGeneric } from './types';

export class Store<Keys, Env extends string> {
  // @ts-ignore
  private kv: StoreGeneric<Keys, Env> = {};
  private env: Env;

  public constructor(env: Env, keyValues?: StoreGeneric<Keys, Env>) {
    if (keyValues) {
      this.kv = keyValues;
    }

    this.env = env;
  }

  public switch(env: Env) {
    this.env = env;
  }

  public set(key: keyof Keys, value: any) {
    this.kv[this.env][key] = value;
  }

  public get<A extends keyof Keys>(key: A): Keys[A] {
    if (typeof this.kv[this.env][key] === 'undefined') {
      throw new Error(`Store: key ${key} does not exists`);
    }

    return this.kv[this.env][key];
  }

  public toJson() {
    return this.kv[this.env];
  }
}
