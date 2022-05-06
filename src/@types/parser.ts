import type { Command } from '../Command';
import type { Option } from '../Option';

// --- Step 1: Parsing
export interface AutoloadConfig {
  path: string;
  ignore?: RegExp;
  allow?: RegExp;
}
export interface ParsedArgv {
  flat: Arg[];
}
export type Arg = ArgOption | ArgValue;
export interface ArgOption {
  type: 'option';
  value: string;
}
export interface ArgValue {
  type: 'value';
  value: string;
}
export interface DirMapping {
  dirPath: string;
  paths: string[];
  isTopic: boolean;
  subs: DirMapping[];
  cmds: {
    paths: string[];
    cmd: Command<any>;
  }[];
}

// --- Step 2: Validation plan
export type ValidationPlan = {
  globalOptions: { cmd: Command<any>; option: Option }[];
  commands: ValidationCommand[];
};

export type ValidationCommand = {
  command: Command<any> | undefined;
  isTopic: boolean;
  paths: string[];
  commands?: ValidationCommand[];
};

// --- Step 3: Execution plan.
export type ExecutionPlan = InvalidExecutionPlan | ValidExecutionPlan;
export type ValidExecutionPlan = {
  plan: ValidExecutionItem[];
  success: boolean;
};
export type InvalidExecutionPlan = {
  plan: ExecutionItems[];
  success: boolean;
};

export type ExecutionItems =
  | InvalidExecutionItem
  | InvalidRootExecutionItem
  | ValidExecutionItem;

export interface ValidExecutionItem {
  command: Command<any>;
  options: Record<string, boolean | number | string>;
  unknownOption?: string[];
}
export interface InvalidExecutionItem {
  options: Record<string, boolean | number | string>;
  unknownOption?: string[];
  unknownCommand: string;
}
export interface InvalidRootExecutionItem {
  unknownOption: string[];
}
