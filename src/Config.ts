import type { ConfigGeneric, ConfigRecord } from './types';

export class Config<TConfig extends ConfigRecord, TEnv extends string> {
  // @ts-expect-error
  private kv: ConfigGeneric<TEnv, Keys> = {};
  private _env: TEnv;
  private _envs: TEnv[];

  constructor({
    configs,
    defaultEnv,
  }: {
    configs: ConfigGeneric<TEnv, TConfig>;
    defaultEnv: TEnv;
  }) {
    if (configs) {
      this.kv = configs;
    }

    this._env = defaultEnv;
    this._envs = Object.keys(configs) as any;
  }

  get env(): TEnv {
    return this._env;
  }

  get envs(): TEnv[] {
    return this._envs;
  }

  is(env: TEnv): boolean {
    return this.env === env;
  }

  switch(env: TEnv): void {
    this._env = env;
  }

  set(key: keyof TConfig, value: any): void {
    this.kv[this.env][key] = value;
  }

  get<TKey extends keyof TConfig>(key: TKey): TConfig[TKey] {
    if (typeof this.kv[this.env][key] === 'undefined') {
      throw new Error(`Store: key "${key}" does not exists`);
    }

    return this.kv[this.env][key];
  }

  toJson(): ConfigGeneric<string, TConfig[string]> {
    return this.kv[this.env];
  }
}
