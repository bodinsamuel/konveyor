import { Command } from '../../../../src';
import type { Conf } from '../../config';

export default new Command<Conf>({
  name: 'connect',
  description: 'Connect to the working environement.',
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
