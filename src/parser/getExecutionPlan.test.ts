import alt from 'altheia-async-data-validator';

import type { ExecutionPlan } from '../@types/parser';
import { Command } from '../Command';
import { argv } from '../__tests__/helpers';
import { defaultRootCommand } from '../helpers/RootCommand';

import { getExecutionPlan } from './getExecutionPlan';

describe('getExecutionPlan()', () => {
  it('should handle nested commands', () => {
    const cmdDeploy = new Command({ name: 'deploy' });
    const cmdFoo = new Command({ name: 'foo' });
    const cmdHello = new Command({ name: 'hello' });
    const execution = getExecutionPlan(argv(['deploy', 'foo', 'hello']), {
      globalOptions: [],
      commands: [
        { command: defaultRootCommand, isTopic: false, paths: [] },
        {
          command: cmdDeploy,
          isTopic: false,
          paths: [],
          commands: [
            {
              command: cmdFoo,
              isTopic: false,
              paths: [],
              commands: [{ command: cmdHello, isTopic: false, paths: [] }],
            },
          ],
        },
      ],
    });
    expect(execution).toStrictEqual<ExecutionPlan>({
      plan: [
        { command: defaultRootCommand, options: {} },
        { command: cmdDeploy, options: {} },
        { command: cmdFoo, options: {} },
        { command: cmdHello, options: {} },
      ],
      success: true,
    });
  });

  describe('unknown', () => {
    it('should handle unknown command', () => {
      const cmdDeploy = new Command({ name: 'deploy' });
      const execution = getExecutionPlan(argv(['foo']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmdDeploy, isTopic: false, paths: [] },
        ],
      });
      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { unknownCommand: 'foo', options: {} },
        ],
        success: false,
      });
    });

    it('should handle unknown option', () => {
      const cmdDeploy = new Command({ name: 'deploy' });
      const execution = getExecutionPlan(argv(['deploy', '--bar']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmdDeploy, isTopic: false, paths: [] },
        ],
      });
      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { command: cmdDeploy, options: {}, unknownOption: ['--bar'] },
        ],
        success: false,
      });
    });
  });

  describe('ROOT_NAME', () => {
    it('should disallow use of ROOT_NAME', () => {
      const execution = getExecutionPlan(argv(['_root_']), {
        globalOptions: [],
        commands: [{ command: defaultRootCommand, isTopic: false, paths: [] }],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { unknownCommand: '_root_', options: {} },
        ],
        success: false,
      });
    });

    it('should magically add ROOT_NAME at first', () => {
      const execution = getExecutionPlan(argv([]), {
        globalOptions: [],
        commands: [{ command: defaultRootCommand, isTopic: false, paths: [] }],
      });
      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [{ command: defaultRootCommand, options: {} }],
        success: true,
      });
    });

    it('should not add ROOT if already present', () => {
      const execution = getExecutionPlan(argv(['--help']), {
        globalOptions: [
          { cmd: defaultRootCommand, option: defaultRootCommand.options[1] },
        ],
        commands: [{ command: defaultRootCommand, isTopic: false, paths: [] }],
      });
      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [{ command: defaultRootCommand, options: { '--help': true } }],
        success: true,
      });
    });
  });

  describe('options', () => {
    it('should append value to previous option when "withValue:true"', () => {
      const cmdDeploy = new Command({
        name: 'deploy',
        options: [Command.option('--foo').value()],
      });
      const execution = getExecutionPlan(argv(['deploy', '--foo', 'hello']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmdDeploy, isTopic: false, paths: [] },
        ],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { command: cmdDeploy, options: { '--foo': 'hello' } },
        ],
        success: true,
      });
    });

    it('should not append value to previous optionwhen "withValue:false"', () => {
      const cmdDeploy = new Command({
        name: 'deploy',
        options: [Command.option('--foo')],
      });
      const execution = getExecutionPlan(argv(['deploy', '--foo', 'hello']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmdDeploy, isTopic: false, paths: [] },
        ],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { command: cmdDeploy, options: { '--foo': true } },
          { options: {}, unknownCommand: 'hello' },
        ],
        success: false,
      });
    });

    it('should parse handle double value in a row', () => {
      const cmdDeploy = new Command({
        name: 'deploy',
        options: [Command.option('--foo').value()],
      });
      const execution = getExecutionPlan(argv(['deploy', '--foo', 'h', 'w']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmdDeploy, isTopic: false, paths: [] },
        ],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { command: cmdDeploy, options: { '--foo': 'h' } },
          { options: {}, unknownCommand: 'w' },
        ],
        success: false,
      });
    });

    it('should handle single dash options and group them', () => {
      const cmd = new Command({
        name: 'multi',
        options: [
          Command.option('-x'),
          Command.option('-c'),
          Command.option('-b'),
          Command.option('-a'),
        ],
      });
      const execution = getExecutionPlan(argv(['multi', '-xcba']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmd, isTopic: false, paths: [] },
        ],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          {
            command: cmd,
            options: { '-a': true, '-b': true, '-c': true, '-x': true },
          },
        ],
        success: true,
      });
    });

    it('should overwrite same option', () => {
      const cmd = new Command({
        name: 'deploy',
        options: [Command.option('--foo').valueValidation(alt.string())],
      });
      const execution = getExecutionPlan(
        argv(['deploy', '--foo', 'bar', '--foo', 'hello']),
        {
          globalOptions: [],
          commands: [
            { command: defaultRootCommand, isTopic: false, paths: [] },
            { command: cmd, isTopic: false, paths: [] },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: defaultRootCommand, options: {} },
          { command: cmd, options: { '--foo': 'hello' } },
        ],
        success: true,
      });
    });

    it('should handle undefined option at root level', () => {
      const cmd = new Command({
        name: 'deploy',
      });
      const execution = getExecutionPlan(argv(['--foobar']), {
        globalOptions: [],
        commands: [
          { command: defaultRootCommand, isTopic: false, paths: [] },
          { command: cmd, isTopic: false, paths: [] },
        ],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          {
            command: defaultRootCommand,
            options: {},
            unknownOption: ['--foobar'],
          },
        ],
        success: false,
      });
    });

    describe('globalOptions', () => {
      it('should handle globalOptions', () => {
        const cmd = new Command({
          name: 'deploy',
          options: [Command.option('--foo').global()],
        });
        const execution = getExecutionPlan(argv(['--foo']), {
          globalOptions: [{ cmd, option: cmd.options[0] }],
          commands: [
            { command: defaultRootCommand, isTopic: false, paths: [] },
            { command: cmd, isTopic: false, paths: [] },
          ],
        });

        expect(execution).toStrictEqual<ExecutionPlan>({
          plan: [
            { command: defaultRootCommand, options: {} },
            { command: cmd, options: { '--foo': true } },
          ],
          success: true,
        });
      });

      it('should handle 2 globalOptions with same command', () => {
        const cmd = new Command({
          name: 'root',
          options: [
            Command.option('--foo').global(),
            Command.option('--bar').global(),
          ],
        });
        const execution = getExecutionPlan(argv(['--foo', '--bar']), {
          globalOptions: [
            { cmd, option: cmd.options[0] },
            { cmd, option: cmd.options[1] },
          ],
          commands: [
            { command: defaultRootCommand, isTopic: false, paths: [] },
            { command: cmd, isTopic: false, paths: [] },
          ],
        });

        expect(execution).toStrictEqual<ExecutionPlan>({
          plan: [
            { command: defaultRootCommand, options: {} },
            { command: cmd, options: { '--foo': true, '--bar': true } },
          ],
          success: true,
        });
      });

      it('should handle 2 globalOptions with different command', () => {
        const cmd1 = new Command({
          name: 'root',
          options: [Command.option('--foo').global()],
        });
        const cmd2 = new Command({
          name: 'deploy',
          options: [Command.option('--bar').global()],
        });
        const execution = getExecutionPlan(argv(['--foo', 'deploy', '--bar']), {
          globalOptions: [{ cmd: cmd1, option: cmd1.options[0] }],
          commands: [
            { command: defaultRootCommand, isTopic: false, paths: [] },
            { command: cmd2, isTopic: false, paths: [] },
          ],
        });

        expect(execution).toStrictEqual<ExecutionPlan>({
          plan: [
            { command: defaultRootCommand, options: {} },
            { command: cmd1, options: { '--foo': true } },
            { command: cmd2, options: { '--bar': true } },
          ],
          success: true,
        });
      });

      it('should handle 2 globalOptions same command not in a row', () => {
        const cmd1 = new Command({
          name: 'root',
          options: [
            Command.option('--foo').global(),
            Command.option('--bar').global(),
          ],
        });
        const cmd2 = new Command({
          name: 'deploy',
          options: [],
        });
        const execution = getExecutionPlan(argv(['--foo', 'deploy', '--bar']), {
          globalOptions: [
            { cmd: cmd1, option: cmd1.options[0] },
            { cmd: cmd1, option: cmd1.options[1] },
          ],
          commands: [
            { command: defaultRootCommand, isTopic: false, paths: [] },
            { command: cmd2, isTopic: false, paths: [] },
          ],
        });

        expect(execution).toStrictEqual<ExecutionPlan>({
          plan: [
            { command: defaultRootCommand, options: {} },
            { command: cmd1, options: { '--foo': true, '--bar': true } },
            { command: cmd2, options: {} },
          ],
          success: true,
        });
      });
    });

    describe('alias', () => {
      it('should understand alias', () => {
        const cmd = new Command({
          name: 'deploy',
          options: [Command.option('--foo').alias('-f', '--foobar')],
        });
        const execution = getExecutionPlan(argv(['deploy', '-f']), {
          globalOptions: [{ cmd, option: cmd.options[0] }],
          commands: [
            { command: defaultRootCommand, isTopic: false, paths: [] },
            { command: cmd, isTopic: false, paths: [] },
          ],
        });

        expect(execution).toStrictEqual<ExecutionPlan>({
          plan: [
            { command: defaultRootCommand, options: {} },
            { command: cmd, options: { '--foo': true } },
          ],
          success: true,
        });
      });

      it('should group alias', () => {
        const cmd = new Command({
          name: 'deploy',
          options: [Command.option('--foo').alias('-f', '--foobar')],
        });
        const execution = getExecutionPlan(
          argv(['deploy', '-f', '--foobar', '--foo']),
          {
            globalOptions: [],
            commands: [
              { command: defaultRootCommand, isTopic: false, paths: [] },
              { command: cmd, isTopic: false, paths: [] },
            ],
          }
        );

        expect(execution).toStrictEqual<ExecutionPlan>({
          plan: [
            { command: defaultRootCommand, options: {} },
            { command: cmd, options: { '--foo': true } },
          ],
          success: true,
        });
      });
    });
  });
});
