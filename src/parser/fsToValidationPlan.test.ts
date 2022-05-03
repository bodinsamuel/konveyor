import type { ValidationPlan } from '../@types/parser';
import { Command } from '../Command';

import { fsToValidationPlan } from './fsToValidationPlan';
import type { DirMapping } from './loadCommandsFromFs';

describe('fsToValidationPlan', () => {
  it('should', () => {
    const dirs: DirMapping = {
      dirPath: '/commands',
      paths: [],
      isTopic: false,
      subs: [
        {
          dirPath: '/commands/sub',
          paths: ['sub'],
          isTopic: false,
          subs: [
            {
              dirPath: '/commands/sub/double',
              paths: ['sub', 'double'],
              isTopic: false,
              subs: [],
              cmds: [
                {
                  basename: 'index',
                  paths: ['sub', 'double', 'index'],
                  cmd: new Command({ name: 'index', description: '' }),
                },
              ],
            },
          ],
          cmds: [
            {
              basename: 'index',
              paths: ['sub', 'index'],
              cmd: new Command({ name: 'index', description: '' }),
            },
          ],
        },
        {
          dirPath: '/commands/topic',
          paths: ['topic'],
          isTopic: true,
          subs: [],
          cmds: [
            {
              basename: 'test',
              paths: ['topic', 'test'],
              cmd: new Command({ name: 'test', description: '' }),
            },
            {
              basename: 'ui',
              paths: ['topic', 'ui'],
              cmd: new Command({ name: 'ui', description: '' }),
            },
          ],
        },
      ],
      cmds: [
        {
          basename: 'check',
          paths: ['check'],
          cmd: new Command({ name: 'check', description: '' }),
        },
      ],
    };

    expect(fsToValidationPlan(dirs)).toStrictEqual<ValidationPlan>({
      commands: [
        { command: 'check', isTopic: false, options: [] },
        {
          command: 'sub',
          isTopic: false,
          options: [],
          commands: [
            { command: 'double', isTopic: false, options: [], commands: [] },
          ],
        },
        {
          command: 'topic',
          options: [],
          isTopic: true,
          commands: [
            { command: 'test', isTopic: false, options: [] },
            { command: 'ui', isTopic: false, options: [] },
          ],
        },
      ],
      options: [],
    });
  });

  it('should output option in non-topic command', () => {
    const options = [Command.option('--foobar')];
    const optionsJson = options[0].toJSON();
    const dirs: DirMapping = {
      dirPath: '/commands',
      paths: [],
      isTopic: false,
      subs: [
        {
          dirPath: '/commands/sub',
          paths: ['sub'],
          isTopic: false,
          subs: [
            {
              dirPath: '/commands/sub/double',
              paths: ['sub', 'double'],
              isTopic: false,
              subs: [],
              cmds: [
                {
                  basename: 'index',
                  paths: ['sub', 'double', 'index'],
                  cmd: new Command({ name: 'index', description: '', options }),
                },
              ],
            },
          ],
          cmds: [
            {
              basename: 'index',
              paths: ['sub', 'index'],
              cmd: new Command({ name: 'index', description: '', options }),
            },
          ],
        },
        {
          dirPath: '/commands/topic',
          paths: ['topic'],
          isTopic: true,
          subs: [],
          cmds: [
            {
              basename: 'test',
              paths: ['topic', 'test'],
              cmd: new Command({ name: 'test', description: '', options }),
            },
          ],
        },
      ],
      cmds: [
        {
          basename: 'check',
          paths: ['check'],
          cmd: new Command({ name: 'check', description: '', options }),
        },
      ],
    };

    expect(fsToValidationPlan(dirs)).toStrictEqual<ValidationPlan>({
      commands: [
        { command: 'check', isTopic: false, options: [optionsJson] },
        {
          command: 'sub',
          isTopic: false,
          options: [optionsJson],
          commands: [
            {
              command: 'double',
              isTopic: false,
              options: [optionsJson],
              commands: [],
            },
          ],
        },
        {
          command: 'topic',
          options: [],
          isTopic: true,
          commands: [
            { command: 'test', isTopic: false, options: [optionsJson] },
          ],
        },
      ],
      options: [],
    });
  });
});
