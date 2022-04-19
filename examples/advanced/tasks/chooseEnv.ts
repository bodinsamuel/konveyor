// import { Task } from 'konveyor';
import { Task } from '../../../src';
import { Env, store } from '../store';

// Create a simple task
// This task will check if the repo is clean from any changes
export const chooseEnv = new Task({
  name: 'choose_env',
  description: 'Select the working environement.',
  isPrivate: true,
  exec: async ({ choices, yesno, exit }): Promise<void> => {
    const env = await choices<keyof typeof Env>(
      'Select an environement:',
      Object.values(Env).map((name) => {
        return {
          name,
        };
      })
    );
    store.switch(env);

    const answer = await yesno(`Do you want to deploy "${env}"?`);
    if (!answer) {
      exit();
    }
  },
});
