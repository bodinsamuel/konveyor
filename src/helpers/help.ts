import { cp } from 'fs';

import * as kolorist from 'kolorist';

import type { ValidationPlan, ValidationTask } from '../@types/parser';

export function help({
  name,
  description,
  version,
  plan,
}: {
  name: string;
  description?: string;
  version: string;
  plan?: ValidationPlan;
}): string {
  const msg: string[] = [];

  if (name) {
    msg.push(`${kolorist.white('NAME')}\r\n`);
    msg.push(`  ${name} @ ${version}\r\n  ${description}`);
  }

  if (plan) {
    msg.push('\r\n');
    msg.push('\r\n');
    if (plan.options.length > 0) {
      msg.push(`${kolorist.white('GLOBAL OPTIONS')}\r\n`);
      msg.push(getOptions(plan.options).join('\r\n'));
    }

    if (plan.commands) {
      msg.push(`\r\n\r\n${kolorist.white('TASKS')}\r\n`);
      msg.push(getTasks(plan.commands).join('\r\n'));
    }
  }

  return msg.join('');
}

function getOptions(options: ValidationPlan['options']): string[] {
  const msg: string[] = [];

  for (const opt of options) {
    msg.push(
      `  ${kolorist.white(opt.name)}${
        opt.aliases && opt.aliases.length > 0
          ? `, ${opt.aliases?.join(',')}`
          : ''
      }`
    );
  }

  return msg;
}

function getTasks(tasks: ValidationTask[]): string[] {
  const msg: string[] = [];

  for (const task of tasks) {
    msg.push(`  ${kolorist.white(task.command)}`);
  }

  return msg;
}
