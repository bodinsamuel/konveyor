import { Command } from '../../../../src';
import type { Conf } from '../../config';

export default new Command<Conf>({
  name: 'db-migrate',
  description: 'Migrate the database',
  async exec({ exec, spinner }, config): Promise<void> {},
});
