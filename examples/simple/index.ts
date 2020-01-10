import { Konveyor, Task } from 'konveyor';

/**
 * ts-node index.ts
 */

// Create a simple task
// This task will check if the repo is clean from any changes
const checkRepo = new Task({
  name: 'check_repo_state',
  description: 'Check repo state',
});

checkRepo.exec(async ({ spinner, exec, log, exit }) => {
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

// Create the main Program and register our task
const prgm = new Konveyor({
  name: 'My awesome script',
  version: '1.0.0',
  tasks: [checkRepo],
});

// Launch the program with process arguments
prgm.start(process.argv);
