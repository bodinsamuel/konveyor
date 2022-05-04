import type { Callback } from '../@types/command';
import { Command } from '../Command';
import type { Konveyor } from '../Konveyor';
import type { Option } from '../Option';

export class RootCommand extends Command<any> {
  #prepare;

  constructor({
    options,
    prepare,
  }: {
    options: Option[];
    prepare: (knvyr: Konveyor<any>) => Callback<any>;
  }) {
    super({ name: 'root', description: '', options });
    this.#prepare = prepare;
  }

  get prepare(): (knvyr: Konveyor<any>) => Callback<any> {
    return this.#prepare;
  }
}

export const defaultRootCommand = new RootCommand({
  options: [
    Command.option('--version', '-v').msg('Show cli version'),
    Command.option('--help').msg('Show help for command').global(),
  ],
  prepare(knvyr): Callback<any> {
    return ({ log }, options): void => {
      if (options['--version']) {
        log.info(knvyr.version);
        return;
      }
      if (options['--help']) {
        log.info(knvyr.getHelp([]));
      }
    };
  },
});
