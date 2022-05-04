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

  it('should produce appropriate plan with one command', () => {
    const source = ['/foo', '/bar', 'deploy', '--foo'];
    const parsed = parseArgv(source);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'value', value: 'deploy' },
        { type: 'option', name: '--foo' },
      ],
    });
  });

  it('should produce appropriate plan with global option', () => {
    const source = ['/foo', '/bar', '--foo', 'deploy'];
    const parsed = parseArgv(source);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: '--foo' },
        { type: 'value', value: 'deploy' },
      ],
    });
  });

  it('should not parse anything after --', () => {
    const source = ['/foo', '/bar', '--', 'everything', '--else'];
    const parsed = parseArgv(source);

    expect(parsed).toStrictEqual({ flat: [] });
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
