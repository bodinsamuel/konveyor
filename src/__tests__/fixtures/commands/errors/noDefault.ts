import { Command } from '../../../../Command';

export const MyCommand = new Command({
  name: 'test',
  description: 'test the project',
  isPrivate: false,
  options: [],
  async exec(): Promise<void> {},
});
