// import { Task } from 'konveyor';
import { Task } from '../../../src';
import type { Env, Conf } from '../config';

// Create a simple task
// This task will check if the repo is clean from any changes
export default new Task<Conf>({
  name: 'choose_env',
  description: 'Select the working environement.',
  isPrivate: true,
  async exec({ choices, yesno, exit }, config): Promise<void> {
    const env = await choices<Env>(
      'Select an environement:',
      config!.listEnv().map((name) => {
        return {
          name,
        };
      })
    );
    config!.switch(env);

    const answer = await yesno(`Do you want to deploy "${env}"?`);
    if (!answer) {
      exit();
    }
  },
});
