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

export interface Validation {
  command?: string;
  options: ValidationOption[];
  commands?: Validation[];
}
export interface ValidationOption {
  name: string;
  withValue?: boolean;
}

/**
 * Parse process.argv and return a list of k/v.
 */
export function parseArgv(argv: string[]): { flat: Arg[] } {
  if (!Array.isArray(argv)) {
    throw new Error('argv must be an array of string');
  }

  // Copy to avoid modifying ref
  const copy = argv.slice();

  // caller
  copy.shift();
  // script path
  copy.shift();

  const args = copy;
  const flat: Arg[] = [];

  // Build a flat map of arguments
  for (const arg of args) {
    // Skip everything after --
    if (arg === '--') {
      break;
    }

    // Handle command
    if (!arg.startsWith('-')) {
      flat.push({ type: 'value', value: arg });
      continue;
    }

    // Handle Options
    const double = arg.startsWith('--');
    const name = arg.substring(double ? 2 : 1);
    if (double) {
      if (name.includes('=')) {
        const [_name, value] = name.split('=', 2);
        flat.push({ type: 'option', name: _name });
        flat.push({ type: 'value', value });
        continue;
      }

      flat.push({ type: 'option', name });
      continue;
    }

    // single letter option
    name.split('').forEach((letter) => {
      flat.push({ type: 'option', name: letter });
    });
  }

  return { flat };
}

/**
 * Build a plan from flat map.
 */
export function validateParsedArgv(
  flat: Arg[],
  val: Validation[]
): { plan: Plan[]; success: boolean } {
  const plan: Plan[] = [];
  let success: boolean = true;
  let context: Validation | undefined;
  let prevOptions: ValidationOption | undefined;

  // We don't push directly to have an empty array in case of no args
  let currGroup: Plan | undefined;

  for (let index = 0; index < flat.length; index++) {
    const prev = flat[index - 1];
    const arg = flat[index];

    // Create default group
    if (!currGroup) {
      currGroup = { options: {} };
      plan.push(currGroup);
    }

    if (arg.type === 'value') {
      if (prev?.type === 'option' && prevOptions?.withValue) {
        // Modify the past option in case we receive a value
        currGroup.options[prev.name] = arg.value;
        continue;
      }

      let hasCommand;
      if (!context) {
        // Root level
        hasCommand = val.find(({ command }) => command === arg.value);
        if (hasCommand) {
          context = hasCommand;
          currGroup.command = arg.value;
          continue;
        }
      } else if (context.commands) {
        // Nest commands
        hasCommand = context.commands.find(
          ({ command }) => command === arg.value
        );
        if (hasCommand) {
          context = hasCommand;
          currGroup = { command: arg.value, options: {} };
          plan.push(currGroup);
          continue;
        }
      }

      // Unknown command
      success = false;
      currGroup.unknownCommand = arg.value;
      continue;
    }

    // Support only one root level with global flag
    if (!context) {
      context = val[0];
    }
    const hasOption = context.options.find(({ name }) => name === arg.name);

    if (hasOption) {
      currGroup.options[arg.name] = true;
      prevOptions = hasOption;
      continue;
    }

    // Unknown options
    if (!currGroup.unknownOption) {
      currGroup.unknownOption = [];
    }
    currGroup.unknownOption.push(arg.name);
    success = false;
  }

  return { plan, success };
}
