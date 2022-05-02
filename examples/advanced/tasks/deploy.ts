import alt from 'altheia-async-data-validator';

import { Task } from '../../../src';
import localConfig from '../config';

import checkRepoState from './checkRepoState';
import chooseEnv from './chooseEnv';
import connectEnv from './connectEnv';

export default new Task({
  name: 'deploy',
  description: 'Deploy your project',
  isPrivate: false,
  dependencies(): Task<any>[] {
    return [/* checkRepoState,*/ chooseEnv, connectEnv];
  },
  options: [
    Task.option('--no-dirty').msg('Ignore dirty repo'),
    Task.option('--env')
      .alias('-e')
      .msg('Environment')
      .valueValidation(alt.string().in(...localConfig.envs)),
  ],

  async exec({ yesno, exit }, config): Promise<void> {
    const answer = await yesno(`Do you want to deploy "${config!.env}"?`);
    if (!answer) {
      exit();
    }
  },
});
