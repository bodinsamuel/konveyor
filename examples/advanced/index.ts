import { Konveyor } from 'konveyor';
import * as tasks from './tasks';

/**
 * tsc index.ts
 */

// Create the main Program and register all our tasks
const prgm = new Konveyor({
  name: 'Deploy script',
  version: '0.0.1',
  tasks: [...Object.values(tasks)],
});

// Launch the program with process arguments
prgm.start(process.argv);
