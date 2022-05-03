import { Command } from '../../../src';

export default new Command({
  name: 'test',
  description: 'Test your project',
  async exec(): Promise<void> {},
});
