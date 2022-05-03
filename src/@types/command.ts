import type { Program } from '../Program';

import type { ConfigDefault } from './config';
import type { Plan } from './parser';

export type Callback<TConf extends ConfigDefault> = (
  program: Program,
  options: Plan['options'],
  config?: TConf
) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore<TConf extends ConfigDefault> = (
  program: Program,
  options: Plan['options'],
  config?: TConf
) => BeforeResponse | Promise<BeforeResponse | void> | void;

export type CallbackAll<TConf extends ConfigDefault> = (
  program: Program,
  config?: TConf
) => Promise<void> | void;
