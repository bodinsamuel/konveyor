import type { ValidationCommand, ValidationPlan } from '../@types/parser';
// import { DuplicateCommandError } from '../errors';

import type { DirMapping } from './loadCommandsFromFs';

export function fsToValidationPlan(dir: DirMapping): ValidationPlan {
  // const names = new Set<string[]>();
  const plan: ValidationPlan = {
    commands: handleCmds(dir),
    options: [],
  };

  return plan;
}

function handleCmds(
  dir: DirMapping,
  ignoreIndex?: boolean
): ValidationCommand[] {
  const commands: ValidationCommand[] = [];
  for (const { cmd } of dir.cmds) {
    if (ignoreIndex && cmd.name === 'index') {
      continue;
    }

    commands.push({
      command: cmd.name,
      isTopic: false,
      options: (cmd.options || []).map((opts) => {
        return opts.toJSON();
      }),
    });
  }

  for (const dir2 of dir.subs) {
    const root = dir2.cmds.find((cmd) => cmd.basename === 'index');
    commands.push({
      command: dir2.paths[dir2.paths.length - 1],
      isTopic: dir2.isTopic,
      options: root
        ? (root.cmd.options || []).map((opts) => {
            return opts.toJSON();
          })
        : [],
      commands: handleCmds(dir2, !dir2.isTopic),
    });
  }

  return commands;
}
