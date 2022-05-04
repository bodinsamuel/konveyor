import alt from 'altheia-async-data-validator';

import type { ExecutionPlan } from '../@types/parser';
import { Command } from '../Command';

import { getExecutionPlan } from './getExecutionPlan';
import { parseArgv } from './parseArgv';

describe('getExecutionPlan()', () => {
  it('should handle nested commands', () => {
    const cmdDeploy = new Command({ name: 'deploy' });
    const cmdFoo = new Command({ name: 'foo' });
    const cmdHello = new Command({ name: 'hello' });
    const execution = getExecutionPlan(
      [
        { type: 'value', value: 'deploy' },
        { type: 'value', value: 'foo' },
        { type: 'value', value: 'hello' },
      ],
      {
        globalOptions: [],
        commands: [
          {
            command: cmdDeploy,
            isTopic: false,
            commands: [
              {
                command: cmdFoo,
                isTopic: false,
                commands: [{ command: cmdHello, isTopic: false }],
              },
            ],
          },
        ],
      }
    );
    expect(execution).toStrictEqual<ExecutionPlan>({
      plan: [
        {
          command: 'deploy',
          options: {},
        },
        {
          command: 'foo',
          options: {},
        },
        {
          command: 'hello',
          options: {},
        },
      ],
      success: true,
    });
  });

  describe('unknown', () => {
    it('should handle unknown command', () => {
      const cmdDeploy = new Command({ name: 'deploy' });
      const execution = getExecutionPlan([{ type: 'value', value: 'foo' }], {
        globalOptions: [],
        commands: [{ command: cmdDeploy, isTopic: false }],
      });
      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          {
            command: 'foo',
            unknownCommand: true,
            options: {},
          },
        ],
        success: false,
      });
    });

    it('should handle unknown option', () => {
      const cmdDeploy = new Command({ name: 'deploy' });
      const execution = getExecutionPlan(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '--bar' },
        ],
        {
          globalOptions: [],
          commands: [{ command: cmdDeploy, isTopic: false }],
        }
      );
      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          {
            command: 'deploy',
            options: {},
            unknownOption: ['--bar'],
          },
        ],
        success: false,
      });
    });
  });

  describe.only('options', () => {
    it('should append value to previous option when "withValue:true"', () => {
      const cmdDeploy = new Command({
        name: 'deploy',
        options: [Command.option('--foo').value()],
      });
      const execution = getExecutionPlan(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmdDeploy,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [{ command: 'deploy', options: { '--foo': 'hello' } }],
        success: true,
      });
    });

    it('should not append value to previous optionwhen "withValue:false"', () => {
      const cmdDeploy = new Command({
        name: 'deploy',
        options: [Command.option('--foo')],
      });
      const execution = getExecutionPlan(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmdDeploy,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          {
            command: 'deploy',
            options: { '--foo': true },
          },
          {
            command: 'hello',
            options: {},
            unknownCommand: true,
          },
        ],
        success: false,
      });
    });

    it('should parse handle double value in a row', () => {
      const cmdDeploy = new Command({
        name: 'deploy',
        options: [Command.option('--foo').value()],
      });
      const execution = getExecutionPlan(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
          { type: 'value', value: 'world' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmdDeploy,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          { command: 'deploy', options: { '--foo': 'hello' } },
          { command: 'world', options: {}, unknownCommand: true },
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
      const execution = getExecutionPlan(
        [
          { type: 'value', value: 'multi' },
          { type: 'option', name: '-x' },
          { type: 'option', name: '-c' },
          { type: 'option', name: '-b' },
          { type: 'option', name: '-a' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmd,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [
          {
            command: 'multi',
            options: { '-a': true, '-b': true, '-c': true, '-x': true },
          },
        ],
        success: true,
      });
    });

    it.only('should understand alias', () => {
      const cmd = new Command({
        name: 'root',
        options: [Command.option('--foo').alias('-f', '--foobar').global()],
      });
      const execution = getExecutionPlan(parseArgv(['-f']).flat, {
        globalOptions: [{ cmd, option: cmd.options[0] }],
        commands: [
          {
            command: cmd,
            isTopic: false,
          },
        ],
      });

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [{ command: 'root', options: { '--foo': true } }],
        success: true,
      });
    });

    it('should group alias', () => {
      const cmd = new Command({
        name: 'root',
        options: [Command.option('--foo').alias('-f', '--foobar')],
      });
      const execution = getExecutionPlan(
        [
          { type: 'option', name: '--foo' },
          { type: 'option', name: '-f' },
          { type: 'option', name: '--foobar' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmd,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [{ command: 'root', options: { '--foo': true } }],
        success: true,
      });
    });

    it('should overwrite same option', () => {
      const cmd = new Command({
        name: 'root',
        options: [Command.option('--foo').valueValidation(alt.string())],
      });
      const execution = getExecutionPlan(
        [
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'bar' },
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmd,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        plan: [{ command: 'root', options: { '--foo': 'hello' } }],
        success: true,
      });
    });

    it('should spread global option', () => {
      const cmd = new Command({
        name: 'deploy',
        options: [Command.option('--help').global()],
      });
      const execution = getExecutionPlan(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '--help' },
        ],
        {
          globalOptions: [],
          commands: [
            {
              command: cmd,
              isTopic: false,
            },
          ],
        }
      );

      expect(execution).toStrictEqual<ExecutionPlan>({
        success: true,
        plan: [
          { command: 'root', options: { '--help': true } },
          { command: 'deploy', options: {} },
        ],
      });
    });
  });
});
