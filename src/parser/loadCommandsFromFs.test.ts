import path from 'path';

import { loadCommandsFromFs } from './loadCommandsFromFs';

describe('loadCommandsFromFs', () => {
  it('should output correct mapping', async () => {
    const mapping = await loadCommandsFromFs({
      dirPath: path.resolve(__dirname, '../..', 'examples/advanced/commands'),
      log: { debug: () => {} } as any,
    });
    expect(mapping).toStrictEqual({
      cmds: [
        {
          basename: 'checkRepoState',
          cmd: expect.any(Object),
          paths: ['checkRepoState'],
        },
        {
          basename: 'chooseEnv',
          cmd: expect.any(Object),
          paths: ['chooseEnv'],
        },
        {
          basename: 'deploy',
          cmd: expect.any(Object),
          paths: ['deploy'],
        },
        {
          basename: 'test',
          cmd: expect.any(Object),
          paths: ['test'],
        },
      ],
      dirPath: expect.any(String),
      isTopic: false,
      paths: [],
      subs: [
        {
          cmds: [
            {
              basename: 'index',
              cmd: expect.any(Object),
              paths: ['db-migrate', 'index'],
            },
          ],
          dirPath: expect.any(String),
          isTopic: false,
          paths: ['db-migrate'],
          subs: [],
        },
        {
          cmds: [
            {
              basename: 'connectEnv',
              cmd: expect.any(Object),
              paths: ['prod', 'connectEnv'],
            },
          ],
          dirPath: expect.any(String),
          isTopic: true,
          paths: ['prod'],
          subs: [],
        },
      ],
    });
  });
});
