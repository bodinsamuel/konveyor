import type {
  DirMapping,
  ValidationCommand,
  ValidationPlan,
} from '../@types/parser';

export function createValidationPlan(dir: DirMapping): ValidationPlan {
  const globalOptions: ValidationPlan['globalOptions'] = [];
  const plan: ValidationPlan = {
    commands: handleCmds({ dir, globalOptions }),
    globalOptions,
  };

  return plan;
}

function handleCmds({
  dir,
  globalOptions,
  ignoreIndex,
}: {
  dir: DirMapping;
  globalOptions: ValidationPlan['globalOptions'];
  ignoreIndex?: boolean;
}): ValidationCommand[] {
  const commands: ValidationCommand[] = [];
  for (const { cmd, paths } of dir.cmds) {
    if (ignoreIndex && paths[paths.length - 1] === 'index') {
      continue;
    }

    cmd.options.forEach((option) => {
      if (option.isGlobal) {
        globalOptions.push({ cmd, option });
      }
    });
    commands.push({
      command: cmd,
      paths,
      isTopic: false,
    });
  }

  for (const dir2 of dir.subs) {
    const root = dir2.cmds.find((cmd) => cmd.basename === 'index');
    if (root) {
      root.cmd.options.forEach((option) => {
        if (option.isGlobal) globalOptions.push({ cmd: root.cmd, option });
      });
    }

    commands.push({
      command: root?.cmd,
      paths: dir2.paths,
      isTopic: dir2.isTopic,
      commands: handleCmds({
        dir: dir2,
        globalOptions,
        ignoreIndex: !dir2.isTopic,
      }),
    });
  }

  return commands;
}
