import boxen from 'boxen';
import chalk from 'chalk';

export function intro(name: string, version: string): string {
  const title = chalk.bold.greenBright(`${name} v${version}`);
  return boxen(title, {
    align: 'center',
    borderColor: 'green',
    dimBorder: true,
    padding: 1,
  });
}
