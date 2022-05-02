import { groupParsedArgv, parseArgv } from './parseArgv';

console.log(process.argv);

describe('parseArgv', () => {
  it('should not modify source', () => {
    const source = ['/foo', '/bar'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(source).toHaveLength(2);
    expect(parsed).toStrictEqual({ flat: [] });
    expect(grouped).toStrictEqual({
      plan: [],
    });
  });

  it('should produce appropriate plan with one command and a boolean option', () => {
    const source = ['/foo', '/bar', 'deploy', '--foo'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'command', name: 'deploy' },
        { type: 'option', name: 'foo', value: true },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ command: 'deploy', options: { foo: true } }],
    });
  });

  it('should produce appropriate plan with global option and one command', () => {
    const source = ['/foo', '/bar', '--foo', 'deploy'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: 'foo', value: true },
        { type: 'command', name: 'deploy' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { foo: true } }, { command: 'deploy', options: {} }],
    });
  });

  it('should parse option with dash', () => {
    const source = ['/foo', '/bar', '--foo-bar'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [{ type: 'option', name: 'foo-bar', value: true }],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { 'foo-bar': true } }],
    });
  });

  it('should parse option with value', () => {
    const source = ['/foo', '/bar', '--foo-bar', 'hello'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: 'foo-bar', value: true },
        { type: 'value', name: 'hello' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { 'foo-bar': 'hello' } }],
    });
  });

  it('should parse option with =value', () => {
    const source = ['/foo', '/bar', '--foo-bar=hello'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [{ type: 'option', name: 'foo-bar', value: 'hello' }],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { 'foo-bar': 'hello' } }],
    });
  });

  it('should not parse options after --', () => {
    const source = ['/foo', '/bar', '--', 'everything', '--else'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({ flat: [] });
    expect(grouped).toStrictEqual({
      plan: [],
    });
  });

  it('should handle value with dash', () => {
    const source = ['/foo', '/bar', 'foo', '"--bar"'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'command', name: 'foo' },
        { type: 'value', name: '"--bar"' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ command: 'foo', options: {} }],
    });
  });

  it('should handle single dash options and group them', () => {
    const source = ['/foo', '/bar', 'deploy', '-xcb', '-a'];
    const parsed = parseArgv(source);
    const grouped = groupParsedArgv(parsed.flat);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'command', name: 'deploy' },
        { type: 'option', name: 'x', value: true },
        { type: 'option', name: 'c', value: true },
        { type: 'option', name: 'b', value: true },
        { type: 'option', name: 'a', value: true },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [
        { command: 'deploy', options: { a: true, b: true, c: true, x: true } },
      ],
    });
  });
});
