// import { Konveyor } from 'konveyor';
import { Konveyor } from '../../src';

import config from './config';

/**
 * @example
 * ts-node index.ts
 */

// Create the main Program and register all our commands
const knv = new Konveyor({
  name: 'my-cli',
  description:
    'An advanced CLI that contains dependents commands, options, nested commands, etc...',
  version: '0.0.1',
  autoload: { path: './commands' },
  config,
});

// Launch the program with process arguments
knv.start(process.argv);
