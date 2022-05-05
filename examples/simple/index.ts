import { Konveyor, Command } from '../../src';

/**
 * Ts-node index.ts.
 */

// This command will check if the repo is clean from any changes
const checkRepo = new Command({
  name: 'check_repo_state',
  description: 'Check if your repository is clean.',
  exec: async ({ spinner, exec, log, exit }): Promise<void> => {
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
      return exit();
    }
  },
});

// Create the main Program and register our command
const knv = new Konveyor({
  name: 'My script',
  version: '1.0.0',
  commands: [checkRepo],
});

// Launch the program with process arguments
knv.start(process.argv);
