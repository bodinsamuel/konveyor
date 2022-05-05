import * as kolorist from 'kolorist';

import type { DirMapping } from '../@types/parser';
import type { Option } from '../Option';

import type { RootCommand } from './RootCommand';

export function help({
  name,
  description,
  version,
  rootCommand,
  dirMapping,
}: // commandsPath,
{
  name: string;
  description?: string;
  version: string;
  rootCommand?: RootCommand;
  dirMapping: DirMapping;
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

  if (rootCommand?.options && rootCommand.options.length > 0) {
    msg.push('\r\n'.repeat(2));
    msg.push(`${kolorist.white('GLOBAL OPTIONS')}\r\n`);
    msg.push(getOptions(rootCommand.options).join('\r\n'));
  }

  if (dirMapping.subs.length > 0) {
    const res = getTopics(dirMapping.subs);
    msg.push(`\r\n\r\n${kolorist.white('TOPICS')}\r\n`);
    msg.push(res.join('\r\n'));
  }

  if (dirMapping.cmds.length > 0) {
    const res = getCommands(dirMapping.cmds);
    msg.push(`\r\n\r\n${kolorist.white('COMMANDS')}\r\n`);
    msg.push(res.join('\r\n'));

    // const pp = commandsPath.join('//');
    // console.log(pp, commandsPath);
    // const list = dirMapping.cmds.find(({ paths }) => paths.join('//') === pp);
    // if (list) {
    //   const res = getCommands(list);
    //   if (res.length > 0) {
    //     msg.push(`\r\n\r\n${kolorist.white('COMMANDS')}\r\n`);
    //     msg.push(res.join('\r\n'));
    //   }
    // }
  }

  return msg.join('');
}

function getOptions(options: Option[]): string[] {
  const msg: string[] = [];

  for (const opt of options) {
    const p = opt.toJSON();
    msg.push(
      `  ${p.name}${
        p.aliases && p.aliases.length > 0 ? `, ${p.aliases?.join(',')}` : ''
      }${p.msg ? `    ${kolorist.dim(p.msg)}` : ''}`
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

    msg.push(`  ${basename}     ${kolorist.dim(cmd.description)}`);
  }

  return msg;
}

function getTopics(subs: DirMapping['subs']): string[] {
  const msg: string[] = [];

  for (const { isTopic, paths } of subs) {
    if (!isTopic) {
      continue;
    }

    msg.push(`  ${paths[paths.length - 1]}`);
  }

  return msg;
}
