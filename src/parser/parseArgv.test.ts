import type { ParsedArgv } from '../@types/parser';

import { parseArgv } from './parseArgv';

describe('parseArgv', () => {
  it('should not modify source', () => {
    const source = ['/foo', '/bar'];
    const parsed = parseArgv(source);

    expect(source).toHaveLength(2);
    expect(parsed).toStrictEqual({ flat: [] });
  });

  it('should produce appropriate plan with one command', () => {
    const source = ['/foo', '/bar', 'deploy', '--foo'];
    const parsed = parseArgv(source);

    expect(parsed).toStrictEqual<ParsedArgv>({
      flat: [
        { type: 'value', value: 'deploy' },
        { type: 'option', value: '--foo' },
      ],
    });
  });

  it('should produce appropriate plan with global option', () => {
    const source = ['/foo', '/bar', '--foo', 'deploy'];
    const parsed = parseArgv(source);

    expect(parsed).toStrictEqual<ParsedArgv>({
      flat: [
        { type: 'option', value: '--foo' },
        { type: 'value', value: 'deploy' },
      ],
    });
  });

  it('should not parse anything after --', () => {
    const source = ['/foo', '/bar', '--', 'everything', '--else'];
    const parsed = parseArgv(source);

    expect(parsed).toStrictEqual<ParsedArgv>({ flat: [] });
  });

  describe('options', () => {
    it('should parse option with value', () => {
      const source = ['/foo', '/bar', '--foo-bar', 'hello'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual<ParsedArgv>({
        flat: [
          { type: 'option', value: '--foo-bar' },
          { type: 'value', value: 'hello' },
        ],
      });
    });

    it('should parse option with dash inside', () => {
      const source = ['/foo', '/bar', '--foo-bar'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual<ParsedArgv>({
        flat: [{ type: 'option', value: '--foo-bar' }],
      });
    });

    it('should parse option with =value', () => {
      const source = ['/foo', '/bar', '--foo-bar=hello'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual<ParsedArgv>({
        flat: [
          { type: 'option', value: '--foo-bar' },
          { type: 'value', value: 'hello' },
        ],
      });
    });

    it('should parse option with =value and value', () => {
      const source = ['/foo', '/bar', '--foo=hello', 'deploy'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual<ParsedArgv>({
        flat: [
          { type: 'option', value: '--foo' },
          { type: 'value', value: 'hello' },
          { type: 'value', value: 'deploy' },
        ],
      });
    });

    it('should handle single dash options and group them', () => {
      const source = ['/foo', '/bar', 'deploy', '-xcb', '-a'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual<ParsedArgv>({
        flat: [
          { type: 'value', value: 'deploy' },
          { type: 'option', value: '-x' },
          { type: 'option', value: '-c' },
          { type: 'option', value: '-b' },
          { type: 'option', value: '-a' },
        ],
      });
    });
  });
});
