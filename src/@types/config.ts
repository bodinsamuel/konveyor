import type { Config } from '../Config';

export type ConfigDefault = Config<any, any>;
export type ConfigRecord = Record<string, any>;
export type ConfigGeneric<TEnv extends string, TKeys extends ConfigRecord> = {
  [key in TEnv]: TKeys;
};
