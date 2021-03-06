// import { Task } from 'konveyor';
import { Task } from '../../../src';
import { checkRepoState } from './checkRepoState';
import { chooseEnv } from './chooseEnv';

export const deploy = new Task({
  name: 'deploy',
  description: 'Deploy your project',
  isPrivate: false,
  dependencies: [checkRepoState, chooseEnv],
});
