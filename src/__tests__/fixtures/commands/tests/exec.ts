import { Command } from '../../../../Command';

export default new Command({
  name: 'test_exex',
  description: 'exec a command',
  isPrivate: false,
  options: [],
  async exec({ exec }): Promise<void> {
    const { output } = await exec('echo "hello world"').promise;
    if (!output.includes('Hello world')) {
      throw new Error('fail to exec');
    }
  },
});
