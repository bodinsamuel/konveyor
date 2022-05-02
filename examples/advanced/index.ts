// import { Konveyor } from 'konveyor';
import { Konveyor } from '../../src';

import config from './config';

/**
 * @example
 * ts-node index.ts
 */

// Create the main Program and register all our tasks
const knv = new Konveyor({
  name: 'my-cli',
  description:
    'An advanced CLI that contains dependents tasks, options, nested tasks, etc...',
  version: '0.0.1',
  tasksPath: './tasks',
  config,
});

// Launch the program with process arguments
knv.start(process.argv);
