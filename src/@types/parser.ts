import type { Command } from '../Command';
import type { Option } from '../Option';

// --- Step 1: Parsing
export interface ParsedArgv {
  flat: Arg[];
}
export type Arg = ArgOption | ArgValue;
export interface ArgOption {
  type: 'option';
  name: string;
}
export interface ArgValue {
  type: 'value';
  value: string;
}

// --- Step 2: Validation plan
export type ValidationPlan = {
  globalOptions: { cmd: Command<any>; option: Option }[];
  commands: ValidationCommand[];
};

export type ValidationCommand = {
  command: Command<any> | undefined;
  isTopic: boolean;
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

export type ExecutionItems = InvalidExecutionItem | ValidExecutionItem;

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
