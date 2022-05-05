import { Command } from '../../../../Command';

export default new Command({
  name: 'topic',
  description: 'topic',
  isPrivate: false,
  options: [],
  exec({ log }): void {
    log.info('Hello from a topic');
  },
});
