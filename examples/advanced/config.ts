import { Config } from '../../src';

// Types our keys that will set in the config
interface Keys {
  version?: string;
  email?: string;
}

// List our possible environement
// We are using an Enum here to use the values elsewhere but a simple type could suffise
export type Env = 'dev' | 'prod';

// Declare our config that we will use in our scripts
export default new Config<Keys, Env>({
  defaultEnv: 'dev',
  configs: {
    dev: {},
    prod: {},
  },
});

export type Conf = Config<Keys, Env>;
