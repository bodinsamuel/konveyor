export type Plan = {
  command?: string;
  options: Record<string, boolean | number | string>;
  unknownCommand?: string;
  unknownOption?: string[];
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
  options: ValidationOption[];
  commands: ValidationTask[];
};

export type ValidationTask = {
  command: string;
  options: ValidationOption[];
  commands?: ValidationTask[];
};

export interface ValidationOption {
  name: string;
  withValue?: boolean;
  aliases?: string[];
}
