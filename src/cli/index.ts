import { Konveyor } from '../Konveyor';

// Create the main Program and autoload all our commands.
const knv = new Konveyor({
  name: 'Deploy script',
  version: '0.0.1',
  autoload: { path: './commands' },
});

knv.start(process.argv);
