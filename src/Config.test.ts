import { Config } from './Config';

describe('typings', () => {
  it('should type config correctly', () => {
    const config = new Config<{ foobar: boolean; str: string }, 'dev'>({
      defaultEnv: 'dev',
      configs: {
        dev: {
          foobar: true,
          str: 'true',
        },
      },
    });

    expect(config).toBeTruthy();
  });
});

describe('set()', () => {
  const config = new Config<{ foobar?: boolean }, 'dev'>({
    defaultEnv: 'dev',
    configs: { dev: {} },
  });

  it('should set correctly', () => {
    config.set('foobar', true);
    expect(config.toJson()).toEqual({
      foobar: true,
    });
  });
});

describe('get()', () => {
  const config = new Config<{ foobar: boolean }, 'dev'>({
    defaultEnv: 'dev',
    configs: {
      dev: { foobar: true },
    },
  });

  it('should get correctly', () => {
    const get = config.get('foobar');
    expect(get).toBe(true);
  });

  it('should throw correctly', () => {
    expect(() => {
      // @ts-expect-error
      config.get('barfoo');
    }).toThrow(`Store: key "barfoo" does not exists`);
  });
});

describe('switch()', () => {
  const config = new Config<{ foobar: boolean }, 'dev' | 'prod'>({
    defaultEnv: 'dev',
    configs: {
      dev: { foobar: true },
      prod: { foobar: false },
    },
  });

  it('should switch env correctly', () => {
    expect(config.is('dev')).toBe(true);
    expect(config.is('prod')).toBe(false);
    const getDev = config.get('foobar');
    expect(getDev).toBe(true);

    config.switch('prod');
    expect(config.is('dev')).toBe(false);
    expect(config.is('prod')).toBe(true);
    const getProd = config.get('foobar');
    expect(getProd).toBe(false);
  });
});
