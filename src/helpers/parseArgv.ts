import type {
  Arg,
  ValidationPlan,
  Plan,
  ValidationOption,
  ValidationTask,
} from '../@types/parser';

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
    if (double) {
      if (arg.includes('=')) {
        const [_name, value] = arg.split('=', 2);
        flat.push({ type: 'option', name: _name });
        flat.push({ type: 'value', value });
        continue;
      }

      flat.push({ type: 'option', name: arg });
      continue;
    }

    // single letter option
    arg
      .replace('-', '')
      .split('')
      .forEach((letter) => {
        flat.push({ type: 'option', name: `-${letter}` });
      });
  }

  return { flat };
}

/**
 * Build a plan from flat map.
 */
export function validateParsedArgv(
  flat: Arg[],
  val: ValidationPlan
): { plan: Plan[]; success: boolean } {
  const plan: Plan[] = [];
  let success: boolean = true;
  let context: ValidationTask | undefined;
  let prevOptions: ValidationOption | undefined;

  // We don't push directly to have an empty array in case of no args
  let currGroup: Plan | undefined;

  for (let index = 0; index < flat.length; index++) {
    const prev = flat[index - 1];
    const arg = flat[index];

    if (arg.type === 'value') {
      if (prev?.type === 'option' && prevOptions?.withValue) {
        // Modify the past option in case we receive a value
        currGroup!.options[prev.name] = arg.value;
        continue;
      }

      const hasCommand = (context || val).commands?.find(
        ({ command }) => command === arg.value
      );
      if (hasCommand) {
        context = hasCommand;
        currGroup = { command: arg.value, options: {} };
        plan.push(currGroup);
        continue;
      }

      // Create default group
      if (!currGroup) {
        currGroup = { options: {} };
        plan.push(currGroup);
      }
      // Unknown command
      success = false;
      currGroup.unknownCommand = arg.value;
      continue;
    }

    // Create default group
    if (!currGroup) {
      currGroup = { options: {} };
      plan.push(currGroup);
    }

    // Support only one root level with global flag
    const hasOption = (context || val).options.find(
      ({ name, aliases }) =>
        name === arg.name || aliases?.find((alias) => alias === arg.name)
    );

    if (hasOption) {
      currGroup.options[hasOption.name] = true;
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
