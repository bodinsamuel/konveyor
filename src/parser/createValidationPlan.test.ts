import type { DirMapping, ValidationPlan } from '../@types/parser';
import { Command } from '../Command';

import { createValidationPlan } from './createValidationPlan';

describe('fsToValidationPlan', () => {
  it('should validate complex nested mapping', () => {
    const cmdCheck = new Command({ name: 'check' });
    const cmdUi = new Command({ name: 'ui' });
    const cmdTest = new Command({ name: 'test' });
    const cmdIndex1 = new Command({ name: 'index1' });
    const cmdIndex2 = new Command({ name: 'index2' });

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
                  cmd: cmdIndex2,
                },
              ],
            },
          ],
          cmds: [
            {
              basename: 'index',
              paths: ['sub', 'index'],
              cmd: cmdIndex1,
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
              cmd: cmdTest,
            },
            {
              basename: 'ui',
              paths: ['topic', 'ui'],
              cmd: cmdUi,
            },
          ],
        },
      ],
      cmds: [
        {
          basename: 'check',
          paths: ['check'],
          cmd: cmdCheck,
        },
      ],
    };

    const validation = createValidationPlan(dirs);
    expect(validation).toStrictEqual<ValidationPlan>({
      commands: [
        { command: cmdCheck, isTopic: false, paths: ['check'] },
        {
          command: cmdIndex1,
          isTopic: false,
          paths: ['sub'],
          commands: [
            {
              command: cmdIndex2,
              isTopic: false,
              commands: [],
              paths: ['sub', 'double'],
            },
          ],
        },
        {
          command: undefined,
          isTopic: true,
          paths: ['topic'],
          commands: [
            { command: cmdTest, isTopic: false, paths: ['topic', 'test'] },
            { command: cmdUi, isTopic: false, paths: ['topic', 'ui'] },
          ],
        },
      ],
      globalOptions: [],
    });
  });

  it('should output option in non-topic command', () => {
    const options = [Command.option('--foobar')];
    const optionGlobal = Command.option('--global').global();

    const cmdCheck = new Command({ name: 'check', description: '', options });
    const cmdTest = new Command({ name: 'test', description: '', options });
    const cmdIndex1 = new Command({ name: 'index1', description: '', options });
    const cmdIndex2 = new Command({
      name: 'index2',
      description: '',
      options: [...options, optionGlobal],
    });

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
                  cmd: cmdIndex2,
                },
              ],
            },
          ],
          cmds: [
            {
              basename: 'index',
              paths: ['sub', 'index'],
              cmd: cmdIndex1,
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
              cmd: cmdTest,
            },
          ],
        },
      ],
      cmds: [
        {
          basename: 'check',
          paths: ['check'],
          cmd: cmdCheck,
        },
      ],
    };

    const plan = createValidationPlan(dirs);
    const commandsRef: ValidationPlan['commands'] = [
      { command: cmdCheck, isTopic: false, paths: ['check'] },
      {
        command: cmdIndex1,
        paths: ['sub'],
        isTopic: false,
        commands: [
          {
            command: cmdIndex2,
            isTopic: false,
            paths: ['sub', 'double'],
            commands: [],
          },
        ],
      },
      {
        command: undefined,
        isTopic: true,
        paths: ['topic'],
        commands: [
          { command: cmdTest, isTopic: false, paths: ['topic', 'test'] },
        ],
      },
    ];
    const optionsRef: ValidationPlan['globalOptions'] = [
      { cmd: cmdIndex2, option: optionGlobal },
    ];

    expect(plan.commands).toStrictEqual(commandsRef);
    expect(plan.globalOptions).toEqual(optionsRef);
  });
});
