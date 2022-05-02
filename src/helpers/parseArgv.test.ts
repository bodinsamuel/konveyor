import { validateParsedArgv, parseArgv } from './parseArgv';

describe('parseArgv', () => {
  it('should not modify source', () => {
    const source = ['/foo', '/bar'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, []);

    expect(source).toHaveLength(2);
    expect(parsed).toStrictEqual({ flat: [] });
    expect(grouped).toStrictEqual({
      plan: [],
    });
  });

  it('should produce appropriate plan with one command and a boolean option', () => {
    const source = ['/foo', '/bar', 'deploy', '--foo'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { command: 'deploy', options: [{ name: 'foo' }] },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'value', value: 'deploy' },
        { type: 'option', name: 'foo' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ command: 'deploy', options: { foo: true } }],
    });
  });

  it('should produce appropriate plan with global option and one value that looks like a value', () => {
    const source = ['/foo', '/bar', '--foo', 'deploy'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      {
        options: [{ name: 'foo', withValue: true }],
        commands: [{ command: 'deploy', options: [] }],
      },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: 'foo' },
        { type: 'value', value: 'deploy' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { foo: 'deploy' } }],
    });
  });

  it('should parse option with dash inside', () => {
    const source = ['/foo', '/bar', '--foo-bar'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { options: [{ name: 'foo-bar' }] },
    ]);

    expect(parsed).toStrictEqual({
      flat: [{ type: 'option', name: 'foo-bar' }],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { 'foo-bar': true } }],
    });
  });

  it('should parse option with value', () => {
    const source = ['/foo', '/bar', '--foo-bar', 'hello'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { command: 'deploy', options: [{ name: 'foo' }] },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: 'foo-bar' },
        { type: 'value', value: 'hello' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { 'foo-bar': 'hello' } }],
    });
  });

  it('should parse option with =value', () => {
    const source = ['/foo', '/bar', '--foo-bar=hello'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { command: 'deploy', options: [{ name: 'foo' }] },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: 'foo-bar' },
        { type: 'value', value: 'hello' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { 'foo-bar': 'hello' } }],
    });
  });

  it('should parse option with =value and value', () => {
    const source = ['/foo', '/bar', '--foo=hello', 'deploy'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      {
        options: [{ name: 'foo', withValue: true }],
        commands: [{ command: 'deploy', options: [] }],
      },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'option', name: 'foo' },
        { type: 'value', value: 'hello' },
        { type: 'value', value: 'deploy' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ options: { foo: 'hello' } }, { command: 'deploy', options: {} }],
    });
  });

  it('should not parse options after --', () => {
    const source = ['/foo', '/bar', '--', 'everything', '--else'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { command: 'deploy', options: [{ name: 'foo' }] },
    ]);

    expect(parsed).toStrictEqual({ flat: [] });
    expect(grouped).toStrictEqual({
      plan: [],
    });
  });

  it('should handle value with dash', () => {
    const source = ['/foo', '/bar', 'foo', '"--bar"'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { command: 'foo', options: [] },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'value', value: 'foo' },
        { type: 'value', value: '"--bar"' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [{ command: 'foo', options: {} }],
    });
  });

  it('should handle single dash options and group them', () => {
    const source = ['/foo', '/bar', 'deploy', '-xcb', '-a'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      {
        command: 'deploy',
        options: [{ name: 'x' }, { name: 'c' }, { name: 'b' }, { name: 'a' }],
      },
    ]);

    expect(parsed).toStrictEqual({
      flat: [
        { type: 'value', value: 'deploy' },
        { type: 'option', name: 'x' },
        { type: 'option', name: 'c' },
        { type: 'option', name: 'b' },
        { type: 'option', name: 'a' },
      ],
    });
    expect(grouped).toStrictEqual({
      plan: [
        { command: 'deploy', options: { a: true, b: true, c: true, x: true } },
      ],
    });
  });
});
