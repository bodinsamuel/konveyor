import path from 'path';

import { Command } from '../../../src';

export default new Command({
  name: 'testa',
  description: 'Test your project',
  async exec({ exec }): Promise<void> {
    const { output: output1 } = await exec(path.join(__dirname, './test.sh'))
      .promise;
    console.log('output1', output1);

    const { output: output2 } = await exec(path.join(__dirname, './test.sh'))
      .promise;
    console.log('output2', output2);
  },
});
