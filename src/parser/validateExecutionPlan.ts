import type {
  Arg,
  ValidationPlan,
  Plan,
  ValidationCommand,
  ValidationOption,
  ValidatedPlan,
} from '../@types/parser';

/**
 * Build a plan from flat map.
 */
export function validateExecutionPlan(
  flat: Arg[],
  val: ValidationPlan
): ValidatedPlan {
  const plan: Plan[] = [];
  let success: boolean = true;
  let context: ValidationCommand | undefined;
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
