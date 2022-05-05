import { Konveyor } from '../../Konveyor';

const knv = new Konveyor({
  name: 'fixture',
  version: '0.0.1',
  autoload: { path: './commands', ignore: /errors/ },
});

knv.start(process.argv);
