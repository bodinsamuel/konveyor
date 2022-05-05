import { Command } from '../../../../Command';

export default new Command({
  name: 'not_a_topic',
  description: 'not a topic',
  isPrivate: false,
  options: [],
  exec({ log }): void {
    log.info('Hello from not a topic');
  },
});
