import { getExecutionPlan } from './getExecutionPlan';
import { parseArgv } from './parseArgv';

describe('parseArgv', () => {
  it('should not modify source', () => {
    const source = ['/foo', '/bar'];
    const parsed = parseArgv(source);
    const grouped = getExecutionPlan(parsed.flat, {
      options: [],
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
      options: [],
      commands: [
        { command: 'deploy', isTopic: false, options: [{ name: '--foo' }] },
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
      options: [{ name: '--foo', withValue: true }],
      commands: [{ command: 'deploy', isTopic: false, options: [] }],
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
      options: [],
      commands: [
        { command: 'deploy', isTopic: false, options: [{ name: 'foo' }] },
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

describe('getExecutionPlan()', () => {
  describe('unknown', () => {
    it('should handle unknown command', () => {
      const grouped = getExecutionPlan([{ type: 'value', value: 'foo' }], {
        options: [],
        commands: [{ command: 'bar', isTopic: false, options: [] }],
      });
      expect(grouped).toStrictEqual({
        plan: [
          {
            unknownCommand: 'foo',
            options: {},
          },
        ],
        success: false,
      });
    });

    it('should handle unknown option', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'value', value: 'foo' },
          { type: 'option', name: '--bar' },
        ],
        {
          options: [],
          commands: [{ command: 'foo', isTopic: false, options: [] }],
        }
      );
      expect(grouped).toStrictEqual({
        plan: [
          {
            command: 'foo',
            options: {},
            unknownOption: ['--bar'],
          },
        ],
        success: false,
      });
    });
  });

  it('should handle nested commands', () => {
    const grouped = getExecutionPlan(
      [
        { type: 'value', value: 'foo' },
        { type: 'value', value: 'bar' },
        { type: 'value', value: 'hello' },
      ],
      {
        options: [],
        commands: [
          {
            command: 'foo',
            options: [],
            isTopic: false,
            commands: [
              {
                command: 'bar',
                options: [],
                isTopic: false,
                commands: [{ command: 'hello', isTopic: false, options: [] }],
              },
            ],
          },
        ],
      }
    );
    expect(grouped).toStrictEqual({
      plan: [
        {
          command: 'foo',
          options: {},
        },
        {
          command: 'bar',
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

  describe('options', () => {
    it('should append value to previous option', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'option', name: '--foo-bar' },
          { type: 'value', value: 'hello' },
        ],
        {
          options: [{ name: '--foo-bar', withValue: true }],
          commands: [
            {
              command: 'deploy',
              options: [],
              isTopic: false,
            },
          ],
        }
      );

      expect(grouped).toStrictEqual({
        plan: [{ options: { '--foo-bar': 'hello' } }],
        success: true,
      });
    });

    it('should not append value to previous option', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'option', name: '--foo-bar' },
          { type: 'value', value: 'hello' },
        ],
        {
          options: [{ name: '--foo-bar', withValue: false }],
          commands: [],
        }
      );

      expect(grouped).toStrictEqual({
        plan: [{ options: { '--foo-bar': true }, unknownCommand: 'hello' }],
        success: false,
      });
    });

    it('should parse handle double value in a row', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
          { type: 'value', value: 'deploy' },
        ],
        {
          options: [{ name: '--foo', withValue: true }],
          commands: [{ command: 'deploy', isTopic: false, options: [] }],
        }
      );

      expect(grouped).toStrictEqual({
        plan: [
          { options: { '--foo': 'hello' } },
          { command: 'deploy', options: {} },
        ],
        success: true,
      });
    });

    it('should handle single dash options and group them', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: '-x' },
          { type: 'option', name: '-c' },
          { type: 'option', name: '-b' },
          { type: 'option', name: '-a' },
        ],
        {
          options: [],
          commands: [
            {
              command: 'deploy',
              isTopic: false,
              options: [
                { name: '-x' },
                { name: '-c' },
                { name: '-b' },
                { name: '-a' },
              ],
            },
          ],
        }
      );

      expect(grouped).toStrictEqual({
        plan: [
          {
            command: 'deploy',
            options: { '-a': true, '-b': true, '-c': true, '-x': true },
          },
        ],
        success: true,
      });
    });

    it('should understand alias', () => {
      const grouped = getExecutionPlan([{ type: 'option', name: '-f' }], {
        options: [
          { name: '--foo', withValue: true, aliases: ['-f', '-foobar'] },
        ],
        commands: [],
      });

      expect(grouped).toStrictEqual({
        plan: [{ options: { '--foo': true } }],
        success: true,
      });
    });

    it('should group alias', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'option', name: '--foo' },
          { type: 'option', name: '-f' },
          { type: 'option', name: '--foobar' },
        ],
        {
          options: [
            { name: '--foo', withValue: true, aliases: ['-f', '--foobar'] },
          ],
          commands: [],
        }
      );

      expect(grouped).toStrictEqual({
        plan: [{ options: { '--foo': true } }],
        success: true,
      });
    });

    it('should overwrite same option', () => {
      const grouped = getExecutionPlan(
        [
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'bar' },
          { type: 'option', name: '--foo' },
          { type: 'value', value: 'hello' },
        ],
        {
          options: [{ name: '--foo', withValue: true }],
          commands: [],
        }
      );

      expect(grouped).toStrictEqual({
        plan: [{ options: { '--foo': 'hello' } }],
        success: true,
      });
    });
  });
});
