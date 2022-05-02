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
      success: true,
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
      success: true,
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
      success: true,
    });
  });

  it('should not parse anything after --', () => {
    const source = ['/foo', '/bar', '--', 'everything', '--else'];
    const parsed = parseArgv(source);
    const grouped = validateParsedArgv(parsed.flat, [
      { command: 'deploy', options: [{ name: 'foo' }] },
    ]);

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
          { type: 'option', name: 'foo-bar' },
          { type: 'value', value: 'hello' },
        ],
      });
    });

    it('should parse option with dash inside', () => {
      const source = ['/foo', '/bar', '--foo-bar'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [{ type: 'option', name: 'foo-bar' }],
      });
    });

    it('should parse option with =value', () => {
      const source = ['/foo', '/bar', '--foo-bar=hello'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [
          { type: 'option', name: 'foo-bar' },
          { type: 'value', value: 'hello' },
        ],
      });
    });

    it('should parse option with =value and value', () => {
      const source = ['/foo', '/bar', '--foo=hello', 'deploy'];
      const parsed = parseArgv(source);

      expect(parsed).toStrictEqual({
        flat: [
          { type: 'option', name: 'foo' },
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
          { type: 'option', name: 'x' },
          { type: 'option', name: 'c' },
          { type: 'option', name: 'b' },
          { type: 'option', name: 'a' },
        ],
      });
    });
  });
});

describe('validateParsedArgv()', () => {
  describe('unknown', () => {
    it('should handle unknown command', () => {
      const grouped = validateParsedArgv(
        [{ type: 'value', value: 'foo' }],
        [{ command: 'bar', options: [] }]
      );
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
      const grouped = validateParsedArgv(
        [
          { type: 'value', value: 'foo' },
          { type: 'option', name: 'bar' },
        ],
        [{ command: 'foo', options: [] }]
      );
      expect(grouped).toStrictEqual({
        plan: [
          {
            command: 'foo',
            options: {},
            unknownOption: ['bar'],
          },
        ],
        success: false,
      });
    });
  });

  it('should handle nested commands', () => {
    const grouped = validateParsedArgv(
      [
        { type: 'value', value: 'foo' },
        { type: 'value', value: 'bar' },
        { type: 'value', value: 'hello' },
      ],
      [
        {
          command: 'foo',
          options: [],
          commands: [
            {
              command: 'bar',
              options: [],
              commands: [{ command: 'hello', options: [] }],
            },
          ],
        },
      ]
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
      const grouped = validateParsedArgv(
        [
          { type: 'option', name: 'foo-bar' },
          { type: 'value', value: 'hello' },
        ],
        [{ command: 'deploy', options: [{ name: 'foo-bar', withValue: true }] }]
      );

      expect(grouped).toStrictEqual({
        plan: [{ options: { 'foo-bar': 'hello' } }],
        success: true,
      });
    });

    it('should not append value to previous option', () => {
      const grouped = validateParsedArgv(
        [
          { type: 'option', name: 'foo-bar' },
          { type: 'value', value: 'hello' },
        ],
        [
          {
            command: 'deploy',
            options: [{ name: 'foo-bar', withValue: false }],
          },
        ]
      );

      expect(grouped).toStrictEqual({
        plan: [{ options: { 'foo-bar': true }, unknownCommand: 'hello' }],
        success: false,
      });
    });

    it('should parse handle double value in a row', () => {
      const grouped = validateParsedArgv(
        [
          { type: 'option', name: 'foo' },
          { type: 'value', value: 'hello' },
          { type: 'value', value: 'deploy' },
        ],
        [
          {
            options: [{ name: 'foo', withValue: true }],
            commands: [{ command: 'deploy', options: [] }],
          },
        ]
      );

      expect(grouped).toStrictEqual({
        plan: [
          { options: { foo: 'hello' } },
          { command: 'deploy', options: {} },
        ],
        success: true,
      });
    });

    it('should handle single dash options and group them', () => {
      const grouped = validateParsedArgv(
        [
          { type: 'value', value: 'deploy' },
          { type: 'option', name: 'x' },
          { type: 'option', name: 'c' },
          { type: 'option', name: 'b' },
          { type: 'option', name: 'a' },
        ],
        [
          {
            command: 'deploy',
            options: [
              { name: 'x' },
              { name: 'c' },
              { name: 'b' },
              { name: 'a' },
            ],
          },
        ]
      );

      expect(grouped).toStrictEqual({
        plan: [
          {
            command: 'deploy',
            options: { a: true, b: true, c: true, x: true },
          },
        ],
        success: true,
      });
    });
  });
});
