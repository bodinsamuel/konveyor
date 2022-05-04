import { Command } from '../Command';

import { getExecutionPlan } from './getExecutionPlan';
import { parseArgv } from './parseArgv';

describe('parseArgv', () => {
  it('should not modify source', () => {
    const source = ['/foo', '/bar'];
    const parsed = parseArgv(source);
    const grouped = getExecutionPlan(parsed.flat, {
      globalOptions: [],
      commands: [],
    });

    expect(source).toHaveLength(2);
    expect(parsed).toStrictEqual({ flat: [] });
    expect(grouped).toStrictEqual({
      plan: [],
      success: true,
    });
  });

  it('should produce appropriate plan with one command and a boolean option', () => {
    const source = ['/foo', '/bar', 'deploy', '--foo'];
    const parsed = parseArgv(source);
    const grouped = getExecutionPlan(parsed.flat, {
      globalOptions: [],
      commands: [
        {
          command: new Command({ name: 'deploy' }),
          isTopic: false,
          options: [{ name: '--foo', global: false }],
        },
      ],
    });

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'value', value: 'deploy' },
        { type: 'option', name: '--foo' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ command: 'deploy', options: { '--foo': true } }],
      success: true,
    });
  });

  it('should produce appropriate plan with global option and one value that looks like a value', () => {
    const source = ['/foo', '/bar', '--foo', 'deploy'];
    const parsed = parseArgv(source);
    const grouped = getExecutionPlan(parsed.flat, {
      globalOptions: [],
      commands: [
        {
          command: 'deploy',
          isTopic: false,
          options: [{ name: '--foo', withValue: true, global: false }],
        },
      ],
    });

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: '--foo' },
        { type: 'value', value: 'deploy' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { '--foo': 'deploy' } }],
      success: true,
    });
  });

  it('should not parse anything after --', () => {
    const source = ['/foo', '/bar', '--', 'everything', '--else'];
    const parsed = parseArgv(source);
    const grouped = getExecutionPlan(parsed.flat, {
      globalOptions: [],
      commands: [
        {
          command: 'deploy',
          isTopic: false,
          options: [{ name: 'foo', global: false }],
        },
      ],
    });

    expect(parsed).toStrictEqual({ flat: [] });
    expect(grouped).toStrictEqual({
      plan: [],
      success: true,
    });
  });

  describe('options', () => {
    it('should parse option with value', () => {
      const source = ['/foo', '/bar', '--foo-bar', 'hello'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [
          { type: 'option', name: '--foo-bar' },
          { type: 'value', value: 'hello' },
        ],
      });
    });

    it('should parse option with dash inside', () => {
      const source = ['/foo', '/bar', '--foo-bar'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [{ type: 'option', name: '--foo-bar' }],
      });
    });

    it('should parse option with =value', () => {
      const source = ['/foo', '/bar', '--foo-bar=hello'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [
          { type: 'option', name: '--foo-bar' },
          { type: 'value', value: 'hello' },
        ],
      });
    });

    it('should parse option with =value and value', () => {
      const source = ['/foo', '/bar', '--foo=hello', 'deploy'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
          { type: 'value', value: 'deploy' },
        ],
      });
    });

    it('should handle single dash options and group them', () => {
      const source = ['/foo', '/bar', 'deploy', '-xcb', '-a'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '-x' },
          { type: 'option', name: '-c' },
          { type: 'option', name: '-b' },
          { type: 'option', name: '-a' },
        ],
      });
    });
  });
});
