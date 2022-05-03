import type { Callback } from '../@types/command';
import { Command } from '../Command';
import type { Konveyor } from '../Konveyor';
import type { Option } from '../Option';

export class RootCommand extends Command<any> {
  constructor({
    options,
    exec,
  }: {
    options: Option[];
    exec: (knvyr: Konveyor<any>) => Callback<any>;
  }) {
    super({ name: '', description: '', options });
  }

  get exec(): Callback<any> | undefined {
    return this._exec;
  }
}

export const defaultRootCommand = new RootCommand({
  options: [
    Command.option('--version').msg('Show cli version'),
    Command.option('--help').msg('Show help for command'),
  ],
  exec(knvyr) {
    return () => {};
  },
});
