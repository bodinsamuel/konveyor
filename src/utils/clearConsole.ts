import readline from 'readline';

export function clearConsole() {
  if (!process.stdout.isTTY) {
    return;
  }

  const blank = '\n'.repeat(process.stdout.rows);
  // eslint-disable-next-line no-console
  console.log(blank);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}
