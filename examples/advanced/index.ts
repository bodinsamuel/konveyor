// import { Konveyor } from 'konveyor';
import { Konveyor } from '../../src';

import * as tasks from './tasks';

/**
 * Ts-node index.ts.
 */

// Create the main Program and register all our tasks
const knv = new Konveyor({
  name: 'Deploy script',
  version: '0.0.1',
  tasks: [...Object.values(tasks)],
});

// Launch the program with process arguments
knv.start(process.argv);
