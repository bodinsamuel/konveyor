import { Config } from '../../src';

// Types our keys that will set in the config
interface Keys {
  version?: string;
  email?: string;
  gcp: {
    project: string;
    cluster: string;
    region: string;
  };
}

// List our possible environement
// We are using an Enum here to use the values elsewhere but a simple type could suffise
export type Env = 'dev' | 'prod';

// Declare our config that we will use in our scripts
export default new Config<Keys, Env>({
  defaultEnv: 'dev',
  configs: {
    dev: {
      gcp: {
        project: 'agolia-crawler',
        region: 'us',
        cluster: 'crawler-prod-2',
      },
    },
    prod: {
      gcp: {
        project: 'agolia-crawler',
        region: 'us',
        cluster: 'crawler-dev-2',
      },
    },
  },
});

export type Conf = Config<Keys, Env>;
