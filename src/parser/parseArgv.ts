import type { Arg, ParsedArgv } from '../@types/parser';

/**
 * Parse process.argv and return a list of k/v.
 */
export function parseArgv(argv: string[]): ParsedArgv {
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
