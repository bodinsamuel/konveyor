import { ExecaChildProcess } from 'execa';
import { Program } from '../Program';

// Task
export type Callback = (program: Program) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore = (
  program: Program
) => Promise<void | BeforeResponse> | BeforeResponse;

// Store
export type StoreGeneric<Keys, Env extends string> = {
  [key in Env]: { [key in keyof Keys]: any };
};

// Program
export type Exec = (command: string) => ExecaChildProcess<string>;
