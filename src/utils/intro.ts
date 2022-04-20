import boxen from 'boxen';
import * as kolorist from 'kolorist';

export function intro(name: string, version: string): string {
  const title = kolorist.lightGreen(kolorist.bold(`${name} v${version}`));
  return boxen(title, {
    align: 'center',
    borderColor: 'green',
    dimBorder: true,
    padding: 1,
  });
}
