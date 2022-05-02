// import { Task } from 'konveyor';
import { Task } from '../../../src';
import type { Env, Conf } from '../config';

// Create a simple task
// This task will check if the repo is clean from any changes
export default new Task<Conf>({
  name: 'choose_env',
  description: 'Select the working environement.',
  isPrivate: true,
  async exec({ choices }, config): Promise<void> {
    const env = await choices<Env>(
      'Select an environement:',
      config!.envs.map((name) => {
        return {
          name,
        };
      })
    );
    config!.switch(env);
  },
});
