import type { ValidationCommand, ValidationPlan } from '../@types/parser';
// import { DuplicateCommandError } from '../errors';

import type { DirMapping } from './loadCommandsFromFs';

export function fsToValidationPlan(dir: DirMapping): ValidationPlan {
  const globalOptions: ValidationPlan['globalOptions'] = [];
  const plan: ValidationPlan = {
    commands: handleCmds(dir, globalOptions),
    globalOptions,
  };

  return plan;
}

function handleCmds(
  dir: DirMapping,
  globalOptions: ValidationPlan['globalOptions'],
  ignoreIndex?: boolean
): ValidationCommand[] {
  const commands: ValidationCommand[] = [];
  for (const { cmd } of dir.cmds) {
    if (ignoreIndex && cmd.name === 'index') {
      continue;
    }

    cmd.options.forEach((option) => {
      if (option.isGlobal) globalOptions.push({ cmd, option });
    });
    commands.push({
      command: cmd,
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
      isTopic: dir2.isTopic,
      commands: handleCmds(dir2, globalOptions, !dir2.isTopic),
    });
  }

  return commands;
}
