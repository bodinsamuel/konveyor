import { Command } from '../../../Command';

export default new Command({
  name: 'test',
  description: 'test the project',
  isPrivate: false,
  options: [],
  exec({ log }): void {
    log.info('hello from test.ts');
  },
});
