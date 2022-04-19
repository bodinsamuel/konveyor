import type { ExecaChildProcess } from 'execa';

import type { Program } from './Program';

// Task
export type Callback = (program: Program) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore = (
  program: Program
) => BeforeResponse | Promise<BeforeResponse | void> | void;

// Store
export type StoreGeneric<
  TEnv extends string,
  TKeys extends { [key: string]: any }
> = {
  [key in TEnv]: TKeys;
};

// Program
export type Exec = (command: string) => ExecaChildProcess<string>;
