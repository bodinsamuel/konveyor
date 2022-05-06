import type {
  Arg,
  ValidationCommand,
  ExecutionPlan,
  ValidationPlan,
  ValidExecutionPlan,
  InvalidExecutionItem,
  ValidExecutionItem,
  InvalidRootExecutionItem,
} from '../@types/parser';
import type { Option } from '../Option';
import { ROOT_NAME } from '../constants';
import { RootCommand } from '../helpers/RootCommand';

/**
 * Build a plan from flat map.
 */
export function getExecutionPlan(
  flat: Arg[],
  val: ValidationPlan
): ExecutionPlan {
  const plan: (
    | InvalidExecutionItem
    | InvalidRootExecutionItem
    | ValidExecutionItem
  )[] = [];
  const copy = flat.slice();
  const res: ExecutionPlan = { plan, success: true };
  const invalidRootOptions: InvalidRootExecutionItem = { unknownOption: [] };

  // Always add root at the beginning of the plan
  const rootCmd = val.commands.find(
    ({ command }) => command instanceof RootCommand
  );
  if (!rootCmd) {
    throw new Error('No RootCommand registered');
  }

  let currGroup: InvalidExecutionItem | ValidExecutionItem | undefined = {
    command: rootCmd.command!,
    options: {},
  };
  plan.push(currGroup);
  let context: ValidationCommand | undefined; // Current command context
  let prevOptions: Option | undefined; // Previous option to append value

  while (copy.length > 0) {
    const arg = copy.shift()!;

    // ---- COMMANDS
    if (arg.type === 'value') {
      if (prevOptions?.expectValue) {
        // Modify the past option in case we receive a value
        currGroup!.options[prevOptions.name] = arg.value;
        prevOptions = undefined;
        continue;
      }

      const hasCommand = (context || val).commands?.find(
        ({ command }) => command?.name === arg.value
      );
      if (!hasCommand || arg.value === ROOT_NAME) {
        // Unknown command
        res.success = false;
        currGroup = { options: {}, unknownCommand: arg.value };
        plan.push(currGroup);
        continue;
      }

      // Context is the previous command so that next command inherit the context
      // It's useful for nested commands
      context = hasCommand;

      currGroup = { command: hasCommand.command!, options: {} };
      plan.push(currGroup);
      continue;
    }

    // ----- GLOBAL OPTIONS
    const isGlobalOption = val.globalOptions.find(({ option }) =>
      option.is(arg.value)
    );
    if (isGlobalOption) {
      let hasGroup = plan.find<ValidExecutionItem>(
        (item): item is ValidExecutionItem =>
          'command' in item && item.command.id === isGlobalOption.cmd.id
      );
      if (!hasGroup) {
        hasGroup = { command: isGlobalOption.cmd, options: {} };
        plan.push(hasGroup);
      }
      hasGroup.options[isGlobalOption.option.name] = true;
      continue;
    }

    // ----- OPTIONS
    if (!currGroup) {
      invalidRootOptions.unknownOption.push(arg.value);
      continue;
      // throw new Error(
      //   `An option ${arg.name} without a command should not be possible`
      // );
    }

    const hasOption = context?.command?.options.find((opt) =>
      opt.is(arg.value)
    );
    if (hasOption) {
      currGroup.options[hasOption.name] = true;
      if (hasOption.expectValue) {
        prevOptions = hasOption;
      }
      continue;
    }

    // Unknown options
    if (!currGroup.unknownOption) {
      currGroup.unknownOption = [];
    }
    currGroup.unknownOption.push(arg.value);
    res.success = false;
  }

  return res;
}

export function isExecutionPlanValid(
  plan: ExecutionPlan
): plan is ValidExecutionPlan {
  return plan.success === true;
}
