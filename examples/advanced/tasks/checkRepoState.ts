import { Task } from 'konveyor';

// Create a simple task
// This task will check if the repo is clean from any changes
export const checkRepoState = new Task({
  name: 'check_repo_state',
  description: 'Check repo state',
});

checkRepoState.exec(async ({ spinner, exec, log, exit }) => {
  spinner.spin('Checking repository...');
  const { stdout } = await exec(`git status --short`);

  if (stdout.length <= 0) {
    spinner.succeed('Repository is clean');
  } else {
    spinner.fail();

    log.help(
      'Your repo is not clean, please commit or stash everything',
      'git stash -u'
    );
    exit(1);
  }
});
