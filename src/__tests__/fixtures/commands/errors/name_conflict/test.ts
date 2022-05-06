import { Command } from '../../../../../Command';

export default new Command({
  name: 'test',
  description: 'Test your project',
  exec({ log }): void {
    log.info('test.ts');
  },
});
