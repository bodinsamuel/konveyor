import { Konveyor } from '../Konveyor';

// Create the main Program and register all our tasks
const knv = new Konveyor({
  name: 'Deploy script',
  version: '0.0.1',
  commandsPath: './commands',
});

knv.start(process.argv);
