import path from 'path';

import type { DirMapping } from '../@types/parser';
import { Logger } from '../Logger';

import { loadCommandsFromFs } from './loadCommandsFromFs';

jest.mock('../Logger');

const dirPath = path.resolve(__dirname, '../', '__tests__/fixtures/commands');
const logger = new Logger();

describe('loadCommandsFromFs', () => {
  it('should allow correctly', async () => {
    const mapping = await loadCommandsFromFs({
      config: {
        path: dirPath,
        allow: /commands\/([A-z]*)\.ts/,
      },
      dirPath,
      log: logger,
    });
    expect(mapping).toStrictEqual<DirMapping>({
      cmds: [{ basename: 'test', paths: ['test'], cmd: expect.any(Object) }],
      dirPath: expect.any(String),
      isTopic: false,
      paths: [],
      subs: [],
    });
  });

  it('should ignore correctly', async () => {
    const mapping = await loadCommandsFromFs({
      config: {
        path: dirPath,
        ignore: /(errors|foreign|not_a_topic|name_conflict|topic)/,
      },
      dirPath,
      log: logger,
    });

    expect(mapping).toStrictEqual<DirMapping>({
      cmds: [{ basename: 'test', paths: ['test'], cmd: expect.any(Object) }],
      dirPath: expect.any(String),
      isTopic: false,
      paths: [],
      subs: [
        {
          dirPath: expect.any(String),
          paths: ['tests'],
          isTopic: true,
          subs: [],
          cmds: [expect.any(Object)],
        },
      ],
    });
  });
});
