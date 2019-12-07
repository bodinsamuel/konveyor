export type StoreGeneric<Keys, Env extends string> = {
  [key in Env]: { [key in keyof Keys]: any };
};

export class Store<Keys, Env extends string> {
  // @ts-ignore
  private kv: StoreGeneric<Keys, Env> = {};
  private env: Env;

  constructor(env: Env, keyValues?: StoreGeneric<Keys, Env>) {
    if (keyValues) {
      this.kv = keyValues;
    }

    this.env = env;
  }

  set(key: keyof Keys, value: any) {
    this.kv[this.env][key] = value;
  }

  get(key: keyof Keys) {
    if (typeof this.kv[this.env][key] === 'undefined') {
      throw new Error(`Store: key ${key} does not exists`);
    }

    return this.kv[this.env][key];
  }
}
