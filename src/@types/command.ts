import type { Program } from '../Program';

import type { ConfigDefault } from './config';

export type Callback<TConf extends ConfigDefault> = (
  program: Program,
  config?: TConf
) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore = (
  program: Program
) => BeforeResponse | Promise<BeforeResponse | void> | void;
