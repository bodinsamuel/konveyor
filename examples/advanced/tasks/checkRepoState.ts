// import { Task, Exec } from 'konveyor';
import type { Exec } from '../../../src';
import { Task } from '../../../src';

// Create a simple task
// This task will check if the repo is clean from any changes
export default new Task({
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
      exit();
    }

    spinner.spin('Checking origin...');
    if (await isUptodateWithOrigin(exec)) {
      spinner.succeed('You are up to date with origin');
    } else {
      spinner.fail();

      log.help('Your repo is up to date with origin', 'git pull');
      exit();
    }
  },
});

async function isRepoClean(exec: Exec): Promise<boolean> {
  const { stdout } = await exec(`git status --porcelain`);
  return stdout.length <= 0;
}

async function isUptodateWithOrigin(exec: Exec): Promise<boolean> {
  const { stdout } = await exec(`git fetch --dry-run`);
  return stdout.length <= 0;
}
