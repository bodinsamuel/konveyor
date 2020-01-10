import { Task } from 'konveyor';
import { Env, store } from '../store';

// Create a simple task
// This task will check if the repo is clean from any changes
export const chooseEnv = new Task({
  name: 'choose_env',
  description: 'Check repo state',
  isPrivate: true,
});

chooseEnv.exec(async ({ choices }) => {
  const env = await choices<string>('Which env?', Object.keys(Env));
  store.switch(env as keyof typeof Env);
});
