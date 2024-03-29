import type { Exec } from '../../../src';
import { Command } from '../../../src';

// This command will check if the repo is clean from any changes
export default new Command({
  name: 'check_repo_state',
  description: 'Check if your repository is clean.',
  isPrivate: true,

  async exec({ spinner, exec, log, exit }): Promise<void> {
    spinner.spin('Checking repository...');
    if (await isRepoClean(exec)) {
      spinner.succeed('Repository is clean');
    } else {
      spinner.fail();

      log.help(
        'Your repo is not clean, please commit or stash everything',
        'git stash -u'
      );
      return exit();
    }

    spinner.spin('Checking origin...');
    if (await isUptodateWithOrigin(exec)) {
      spinner.succeed('You are up to date with origin');
    } else {
      spinner.fail();

      log.help('Your repo is up to date with origin', 'git pull');
      return exit();
    }
  },
});

async function isRepoClean(exec: Exec): Promise<boolean> {
  const { output } = await exec(`git status --porcelain`).promise;
  return output.length <= 0;
}

async function isUptodateWithOrigin(exec: Exec): Promise<boolean> {
  const { output } = await exec(`git fetch --dry-run`).promise;
  return output.length <= 0;
}
