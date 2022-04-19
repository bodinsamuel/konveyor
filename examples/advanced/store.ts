/* eslint-disable import/no-unresolved */
import { Store } from 'konveyor';

// Types our keys that will set in the store
type Keys = {
  version?: string;
  email?: string;
};

// List our possible environement
// We are using an Enum here to use the values elsewhere but a simple type could suffise
export enum Env {
  'prod' = 'prod',
  'dev' = 'dev',
}

// Declare our store that we will use in our scripts
export const store = new Store<keyof typeof Env, Keys>('dev', {
  dev: {},
  prod: {},
});
