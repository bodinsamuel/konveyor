import { Konveyor } from '../Konveyor';

import { getLogger, nodeJsArgv } from './helpers';

jest.mock('../utils/exit');
jest.setTimeout(10000);

describe('root', () => {
  it('should output --help', async () => {
    const { stream, logger } = getLogger();
    const knv = new Konveyor({
      name: 'Test',
      version: '0.0.1',
      logger,
    });

    await knv.start(nodeJsArgv(['--help']));
    const joined = stream.join('\r\n');

    const msgs = [
      '---- Konveyor Start',
      'Loaded from FS:',
      'isTopic: false,',
      'paths: [],',
      'subs: [],',
      "cmds: [ { basename: 'root', cmd: RootCommand [root] {}, paths: [] } ]",
      'Validation plan:',
      'commands: [ { command: RootCommand [root] {}, isTopic: false } ],',
      'globalOptions:',
      'cmd: RootCommand [root] {}, option: Option [--version] {}',
      'cmd: RootCommand [root] {}, option: Option [--help] {}',
      'Execution plan:',
      "plan: [ { command: RootCommand [root] {}, options: { '--help': true } } ],",
      'success: true',
      'Executing command: root',
      'NAME',
      'Test',
      '@ 0.0.1',
      'GLOBAL OPTIONS',
      '--version, -v',
      'Show cli version',
      '--help',
      'Show help for command',
      'COMMANDS',
      '---- Konveyor Exit (0)',
    ];

    let copy = joined.substring(0).trim();
    while (msgs.length > 0 && copy.length > 0) {
      const msg = msgs.shift()!;
      const index = copy.indexOf(msg);
      if (index === -1) {
        // eslint-disable-next-line no-console
        console.error(msg);
        break;
      }

      const slice = copy.substring(index, index + msg.length);
      expect(slice).toEqual(msg);
      copy = copy.substring(index + msg.length);
    }

    expect(msgs).toHaveLength(0);
    expect(copy).toHaveLength(0);

    expect(joined).not.toMatch('Autoload commands from path');
  });

  it('should output --version', async () => {
    const { stream, logger } = getLogger();
    const knv = new Konveyor({
      name: 'Test',
      version: '0.0.1',
      logger,
    });

    await knv.start(nodeJsArgv(['--version']));
    const joined = stream.join('\r\n');
    expect(joined).toMatch('0.0.1');
  });
});

describe.only('fixtures', () => {
  it.only('should load everything correctly', async () => {
    const { stream, logger } = getLogger();
    const knv = new Konveyor({
      name: 'Test',
      version: '0.0.1',
      logger,
      autoload: { path: './fixtures/commands', ignore: /errors/ },
    });

    await knv.start(nodeJsArgv(['--help']));
    const joined = stream.join('\r\n');
    expect(joined).toBe('erer');
    expect(joined).toMatch(/Skipped(.*)\/notgood.csv"/);
  });

  it('should throw on noDefault', async () => {
    const { stream, logger } = getLogger();
    const knv = new Konveyor({
      name: 'Test',
      version: '0.0.1',
      logger,
      autoload: { path: './fixtures/commands', allow: /errors\/noDefault.ts/ },
    });

    await knv.start(nodeJsArgv(['--help']));
    const joined = stream.join('\r\n');
    expect(joined).toMatch(
      /Error(.*)\/noDefault.ts" does not export a 'default' prop/
    );
  });

  it('should throw on notACommand', async () => {
    const { stream, logger } = getLogger();
    const knv = new Konveyor({
      name: 'Test',
      version: '0.0.1',
      logger,
      autoload: {
        path: './fixtures/commands',
        allow: /errors\/notACommand.ts/,
      },
    });

    await knv.start(nodeJsArgv(['--help']));
    const joined = stream.join('\r\n');
    expect(joined).toMatch(
      /Error(.*)\/notACommand.ts" does not export a valid Command \[Object\]/
    );
  });
});