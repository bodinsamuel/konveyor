import type {
  Arg,
  Plan,
  ValidationCommand,
  ExecutionPlan,
  ValidationPlan,
} from '../@types/parser';
import type { Option } from '../Option';

/**
 * Build a plan from flat map.
 */
export function getExecutionPlan(
  flat: Arg[],
  val: ValidationPlan
): ExecutionPlan {
  const plan: Plan[] = [];
  let success: boolean = true;
  let context: ValidationCommand | undefined;
  let prevOptions: Option | undefined;

  // We don't push directly to have an empty array in case of no args
  let currGroup: Plan | undefined;

  for (let index = 0; index < flat.length; index++) {
    const prev = flat[index - 1];
    const arg = flat[index];

    // ---- COMMANDS
    if (arg.type === 'value') {
      if (prev?.type === 'option' && prevOptions?.expectValue) {
        // Modify the past option in case we receive a value
        currGroup!.options[prev.name] = arg.value;
        continue;
      }

      // Only add a new group on new command
      currGroup = { command: '', options: {} };
      plan.push(currGroup);

      currGroup.command = arg.value;
      const hasCommand = (context || val).commands?.find(
        ({ command }) => command?.name === arg.value
      );
      if (hasCommand) {
        context = hasCommand;
        continue;
      }

      // Unknown command
      success = false;
      currGroup.unknownCommand = true;
      break;
    }

    if (!currGroup) {
      throw new Error('An option without a command should not be possible');
    }

    // ----- OPTIONS
    const isGlobalOption = val.globalOptions.find(({ option }) =>
      option.is(arg.name)
    );
    if (isGlobalOption) {
      continue;
    }

    const hasOption = context?.command?.options.find((opt) => opt.is(arg.name));
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
