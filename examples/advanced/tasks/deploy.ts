// import { Task } from 'konveyor';
import { Konveyor, Task } from '../../../src';

import checkRepoState from './checkRepoState';
import chooseEnv from './chooseEnv';

export default new Task({
  name: 'deploy',
  description: 'Deploy your project',
  isPrivate: false,
  dependencies(): Task<any>[] {
    return [checkRepoState, chooseEnv];
  },
  options: [Konveyor.option('--ignore-dirty')],
});
