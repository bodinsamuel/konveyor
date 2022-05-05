import * as kolorist from 'kolorist';

import type { ValidationPlan } from '../@types/parser';

export function help({
  name,
  description,
  version,
  plan,
}: // commandsPath,
{
  name: string;
  description?: string;
  version: string;
  plan: ValidationPlan;
  commandsPath: string[];
}): string {
  const msg: string[] = [];

  if (name) {
    msg.push(`${kolorist.white('NAME')}\r\n`);
    msg.push(`  ${name} ${kolorist.dim(`@ ${version}`)}`);
    if (description) {
      msg.push(`\r\n ${description}`);
    }
  }

  if (plan.globalOptions.length > 0) {
    msg.push('\r\n'.repeat(2));
    msg.push(`${kolorist.white('GLOBAL OPTIONS')}\r\n`);
    msg.push(getOptions(plan.globalOptions).join('\r\n'));
  }

  if (plan.commands.length > 0) {
    const topics = [];
    const cmds = [];

    for (const { isTopic, paths, command } of plan.commands) {
      if (isTopic) {
        topics.push(`  ${paths[paths.length - 1]}`);
        continue;
      }

      if (command?.isPrivate) {
        continue;
      }
      cmds.push(`  ${command!.name}     ${kolorist.dim(command!.description)}`);
    }

    if (topics.length > 0) {
      msg.push(`\r\n\r\n${kolorist.white('TOPICS')}\r\n`);
      msg.push(topics.join('\r\n'));
    }

    if (cmds.length > 0) {
      msg.push(`\r\n\r\n${kolorist.white('COMMANDS')}\r\n`);
      msg.push(cmds.join('\r\n'));
    }
  }

  return msg.join('');
}

function getOptions(options: ValidationPlan['globalOptions']): string[] {
  const msg: string[] = [];

  for (const { option } of options) {
    const p = option.toJSON();
    msg.push(
      `  ${p.name}${
        p.aliases && p.aliases.length > 0 ? `, ${p.aliases?.join(',')}` : ''
      }${p.msg ? `    ${kolorist.dim(p.msg)}` : ''}`
    );
  }

  return msg;
}
