// import { Task } from 'konveyor';
import { Konveyor, Task } from '../../../src';
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
    Konveyor.option('--ignore-dirty'),
    Konveyor.option('--env', 'Environment').choices(localConfig.envs),
  ],

  async exec({ yesno, exit }, config): Promise<void> {
    const answer = await yesno(`Do you want to deploy "${config!.env}"?`);
    if (!answer) {
      exit();
    }
  },
});
