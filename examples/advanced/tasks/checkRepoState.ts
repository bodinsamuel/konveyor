import { Task } from 'konveyor';
import { Exec } from 'konveyor/dist/types';

// Create a simple task
// This task will check if the repo is clean from any changes
export const checkRepoState = new Task({
  name: 'check_repo_state',
  description: 'Check repo state',
  isPrivate: true,
});

checkRepoState.exec(async ({ spinner, exec, log, exit }) => {
  spinner.spin('Checking repository...');
  if (await isRepoClean(exec)) {
    spinner.succeed('Repository is clean');
  } else {
    spinner.fail();

    log.help(
      'Your repo is not clean, please commit or stash everything',
      'git stash -u'
    );
    await exit(1);
  }

  spinner.spin('Checking origin...');
  if (await isUptodateWithOrigin(exec)) {
    spinner.succeed('You are up to date with origin');
  } else {
    spinner.fail();

    log.help('Your repo is up to date with origin', 'git pull');
    await exit(1);
  }
});

async function isRepoClean(exec: Exec): Promise<boolean> {
  const { stdout } = await exec(`git status --porcelain`);
  return stdout.length <= 0;
}

async function isUptodateWithOrigin(exec: Exec): Promise<boolean> {
  const { stdout } = await exec(`git fetch --dry-run`);
  return stdout.length <= 0;
}
