import * as kolorist from 'kolorist';

import type { Option } from '../Option';

import type { RootCommand } from './RootCommand';
import type { DirMapping } from './loadCommandsFromFs';

export function help({
  name,
  description,
  version,
  rootCommand,
  commands,
  commandsPath,
}: {
  name: string;
  description?: string;
  version: string;
  rootCommand?: RootCommand;
  commands: DirMapping[];
  commandsPath: string[];
}): string {
  const msg: string[] = [];

  if (name) {
    msg.push(`${kolorist.white('NAME')}\r\n`);
    msg.push(`  ${name} @ ${version}\r\n  ${description}`);
  }

  if (rootCommand?.options && rootCommand.options.length > 0) {
    msg.push('\r\n'.repeat(2));
    msg.push(`${kolorist.white('GLOBAL OPTIONS')}\r\n`);
    msg.push(getOptions(rootCommand.options).join('\r\n'));
  }

  if (commands.length > 0) {
    const pp = commandsPath.join('//');
    console.log(pp, commandsPath);
    const list = commands.find(({ paths }) => paths.join('//') === pp);
    if (list) {
      const res = getCommands(list.cmds);
      if (res.length > 0) {
        msg.push(`\r\n\r\n${kolorist.white('COMMANDS')}\r\n`);
        msg.push(res.join('\r\n'));
      }
    }
  }

  return msg.join('');
}

function getOptions(options: Option[]): string[] {
  const msg: string[] = [];

  for (const opt of options) {
    const p = opt.toJSON();
    msg.push(
      `  ${kolorist.white(p.name)}${
        p.aliases && p.aliases.length > 0 ? `, ${p.aliases?.join(',')}` : ''
      }${p.msg ? `    ${p.msg}` : ''}`
    );
  }

  return msg;
}

function getCommands(commands: DirMapping['cmds']): string[] {
  const msg: string[] = [];

  for (const { cmd, basename } of commands) {
    if (cmd.isPrivate) {
      continue;
    }

    msg.push(`  ${kolorist.white(basename)}\r\n     ${cmd.description}`);
  }

  return msg;
}
