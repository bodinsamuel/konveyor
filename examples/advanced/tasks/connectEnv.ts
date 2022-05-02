// import { Task } from 'konveyor';
import { Task } from '../../../src';
import type { Conf } from '../config';

// Create a simple task
// This task will check if the repo is clean from any changes
export default new Task<Conf>({
  name: 'connect_env',
  description: 'Connect to the working environement.',
  isPrivate: true,
  async exec({ exec, spinner }, config): Promise<void> {
    const conf = config!.get('gcp');

    spinner.spin('Switching in gcloud');
    await exec(`gcloud config set project ${conf.project}`);

    spinner.spin('Getting context');
    await exec(
      `gcloud container clusters get-credentials ${conf.cluster} --region ${conf.region} --project ${conf.project}`
    );

    spinner.succeed(`Connected to ${config!.env}`);
  },
});
