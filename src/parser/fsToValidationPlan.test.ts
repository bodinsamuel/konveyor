import type { ValidationPlan } from '../@types/parser';
import { Command } from '../Command';

import { fsToValidationPlan } from './fsToValidationPlan';
import type { DirMapping } from './loadCommandsFromFs';

describe('fsToValidationPlan', () => {
  it('should', () => {
    const cmdCheck = new Command({ name: 'check' });
    const cmdUi = new Command({ name: 'ui' });
    const cmdTest = new Command({ name: 'test' });
    const cmdIndex1 = new Command({ name: 'index' });
    const cmdIndex2 = new Command({ name: 'index' });

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

    expect(fsToValidationPlan(dirs)).toStrictEqual<ValidationPlan>({
      commands: [
        { command: cmdCheck, isTopic: false },
        {
          command: cmdIndex1,
          isTopic: false,
          commands: [{ command: cmdIndex2, isTopic: false, commands: [] }],
        },
        {
          command: undefined,
          isTopic: true,
          commands: [
            { command: cmdTest, isTopic: false },
            { command: cmdUi, isTopic: false },
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
    const cmdIndex1 = new Command({ name: 'index', description: '', options });
    const cmdIndex2 = new Command({
      name: 'index',
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

    const plan = fsToValidationPlan(dirs);
    const commandsRef: ValidationPlan['commands'] = [
      { command: cmdCheck, isTopic: false },
      {
        command: cmdIndex1,
        isTopic: false,
        commands: [
          {
            command: cmdIndex2,
            isTopic: false,
            commands: [],
          },
        ],
      },
      {
        command: undefined,
        isTopic: true,
        commands: [{ command: cmdTest, isTopic: false }],
      },
    ];
    const optionsRef: ValidationPlan['globalOptions'] = [
      { cmd: cmdIndex2, option: optionGlobal },
    ];
    expect(plan.commands).toStrictEqual(commandsRef);
    expect(plan.globalOptions).toEqual(optionsRef);
  });
});
