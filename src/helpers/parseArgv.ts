export type Plan = {
  command?: string;
  options: Record<string, boolean | number | string>;
  value?: string;
};

export type Arg =
  | {
      type: 'command';
      name: string;
    }
  | {
      type: 'option';
      name: string;
      value: boolean | string;
    }
  | {
      type: 'value';
      value: string;
    };

/**
 * Parse process.argv and return a list of k/v.
 */
export function parseArgv(argv: string[]): { flat: Arg[] } {
  if (!Array.isArray(argv)) {
    throw new Error('argv must be an array of string');
  }

  // Copy to avoid modifying ref
  const copy = argv.slice();
  copy.shift();

  const scriptPath = copy.shift();
  const args = copy;

  const flat: Arg[] = [];

  // Build a flat map of arguments
  for (const arg of args) {
    // Skip everything after --
    if (arg === '--') {
      break;
    }

    const prev = flat[flat.length - 1];

    // Handle command
    if (!arg.startsWith('-')) {
      if (prev && prev.type === 'option' && !prev.value) {
        // Special case for option with value separated with space
        flat.push({ type: 'value', value: arg });
        continue;
      }

      flat.push({ type: 'command', name: arg });
      continue;
    }

    // Handle Options
    const double = arg.startsWith('--');
    let name = arg.substring(double ? 2 : 1);
    if (double) {
      let value: any = true;
      if (name.includes('=')) {
        [name, value] = name.split('=', 2);
      }
      flat.push({ type: 'option', name, value });
      continue;
    }

    // single letter option
    name.split('').forEach((letter) => {
      flat.push({ type: 'option', name: letter, value: true });
    });
  }

  return { flat };
}

/**
 * Build a plan from flat map.
 */
export function groupParsedArgv(flat: Arg[]): { plan: Plan[] } {
  const plan: Plan[] = [];
  // We don't push directly to have an empty array in case of no args
  let currGroup: Plan | undefined;

  for (const arg of flat) {
    // Create default group
    if (!currGroup) {
      currGroup = { options: {} };
      plan.push(currGroup);
    }

    if (arg.type === 'command') {
      if (currGroup.command || Object.keys(currGroup.options).length > 0) {
        currGroup = { options: {} };
        plan.push(currGroup);
      }

      currGroup.command = arg.name;
      continue;
    }

    if (arg.type === 'value') {
      currGroup.value = arg.value;
      continue;
    }

    currGroup.options[arg.name] = arg.value!;
  }

  return { plan };
}
