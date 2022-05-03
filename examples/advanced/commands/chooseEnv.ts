import { Command } from '../../../src';
import type { Env, Conf } from '../config';

export default new Command<Conf>({
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
