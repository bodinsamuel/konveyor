import type { Command } from '../Command';
import type { Option } from '../Option';

export type Plan = {
  command: string;
  options: Record<string, boolean | number | string>;
  unknownOption?: string[];
  unknownCommand?: true;
};

export type Arg = ArgOption | ArgValue;
export interface ArgOption {
  type: 'option';
  name: string;
}
export interface ArgValue {
  type: 'value';
  value: string;
}

export type ValidationPlan = {
  globalOptions: { cmd: Command<any>; option: Option }[];
  commands: ValidationCommand[];
};

export type ValidationCommand = {
  command: Command<any> | undefined;
  isTopic: boolean;
  commands?: ValidationCommand[];
};

export interface ExecutionPlan {
  plan: Plan[];
  success: boolean;
}
