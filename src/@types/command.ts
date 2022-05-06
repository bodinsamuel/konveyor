import type { Command } from '../Command';
import type { Program } from '../program';

import type { ConfigDefault } from './config';
import type { ValidExecutionItem } from './parser';

export type Callback<TConf extends ConfigDefault> = (
  program: Program,
  options: ValidExecutionItem['options'],
  config?: TConf
) => Promise<void> | void;
export type BeforeResponse = { skip: boolean };
export type CallbackBefore<TConf extends ConfigDefault> = (
  program: Program,
  options: ValidExecutionItem['options'],
  config?: TConf
) => BeforeResponse | Promise<BeforeResponse | void> | void;

export type CallbackAll<TConf extends ConfigDefault> = (
  program: Program,
  config?: TConf
) => Promise<void> | void;

export type DependenciesPlan<TConf extends ConfigDefault> = (
  program: Program,
  options: ValidExecutionItem['options'],
  config?: TConf
) => Command<TConf>[];
