import alt from 'altheia-async-data-validator';

import { Command } from '../../../src';
import localConfig from '../config';

// import checkRepoState from './checkRepoState';
import chooseEnv from './chooseEnv';
import connectEnv from './prod/connectEnv';

export default new Command({
  name: 'deploy',
  description: 'Deploy your project',
  isPrivate: false,
  dependencies(): Command<any>[] {
    return [/* checkRepoState,*/ chooseEnv, connectEnv];
  },
  options: [
    Command.option('--no-dirty').msg('Ignore dirty repo'),
    Command.option('--env')
      .alias('-e')
      .msg('Environment')
      .valueValidation(alt.string().in(...localConfig.envs)),
  ],

  async exec({ yesno, exit }, options, config): Promise<void> {
    const answer = await yesno(`Do you want to deploy "${config!.env}"?`);
    if (!answer) {
      return exit();
    }
  },
});
