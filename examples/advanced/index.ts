// import { Konveyor } from 'konveyor';
import { Konveyor } from '../../src';

import config from './config';

/**
 * @example
 * ts-node index.ts
 */

// Create the main Program and register all our tasks
const knv = new Konveyor({
  name: 'Deploy script',
  version: '0.0.1',
  tasksPath: './tasks',
  config,
});

// Launch the program with process arguments
knv.start(process.argv);
