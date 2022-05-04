import type {
  Arg,
  ValidationCommand,
  ExecutionPlan,
  ValidationPlan,
  ValidExecutionPlan,
  InvalidExecutionItem,
  ValidExecutionItem,
} from '../@types/parser';
import type { Option } from '../Option';

/**
 * Build a plan from flat map.
 */
export function getExecutionPlan(
  flat: Arg[],
  val: ValidationPlan
): ExecutionPlan {
  const plan: InvalidExecutionItem | ValidExecutionItem[] = [];
  const copy = flat.slice();
  const res: ExecutionPlan = { plan, success: true };
  let context: ValidationCommand | undefined;
  let prevOptions: Option | undefined;

  // We don't push directly to have an empty array in case of no args
  let currGroup: InvalidExecutionItem | ValidExecutionItem | undefined;

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
      if (!hasCommand) {
        // Unknown command
        res.success = false;
        currGroup = { options: {}, unknownCommand: arg.value };
        plan.push(currGroup as any);
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
      option.is(arg.name)
    );
    if (isGlobalOption) {
      let hasGroup = plan.find(
        (item) => 'command' in item && item.command.id === isGlobalOption.cmd.id
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
      throw new Error('An option without a command should not be possible');
    }

    const hasOption = context?.command?.options.find((opt) => opt.is(arg.name));
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
    currGroup.unknownOption.push(arg.name);
    res.success = false;
  }

  return res;
}

export function isExecutionPlanValid(
  plan: ExecutionPlan
): plan is ValidExecutionPlan {
  return plan.success === true;
}
