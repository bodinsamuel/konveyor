import type { ExecaChildProcess } from 'execa';

import type { Config } from './Config';
import type { Program } from './Program';

// Task
export type Callback<TConf extends ConfigDefault> = (
  program: Program,
  config?: TConf
) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore = (
  program: Program
) => BeforeResponse | Promise<BeforeResponse | void> | void;

// Config
export type ConfigDefault = Config<any, any>;
export type ConfigRecord = Record<string, any>;
export type ConfigGeneric<TEnv extends string, TKeys extends ConfigRecord> = {
  [key in TEnv]: TKeys;
};

// Program
export type Exec = (command: string) => ExecaChildProcess<string>;
