import { Store } from './Store';

describe('typings', () => {
  it('should type store correctly', () => {
    const store = new Store<'dev', { foobar: boolean; str: string }>('dev', {
      dev: {
        foobar: true,
        str: 'true',
      },
    });

    expect(store).toBeTruthy();
  });
});

describe('set()', () => {
  const store = new Store<'dev', { foobar?: boolean }>('dev', { dev: {} });

  it('should set correctly', () => {
    store.set('foobar', true);
    expect(store.toJson()).toEqual({
      foobar: true,
    });
  });
});

describe('get()', () => {
  const store = new Store<'dev', { foobar: boolean }>('dev', {
    dev: { foobar: true },
  });

  it('should get correctly', () => {
    const get = store.get('foobar');
    expect(get).toBe(true);
  });

  it('should throw correctly', () => {
    expect(() => {
      // @ts-expect-error
      store.get('barfoo');
    }).toThrow(`Store: key "barfoo" does not exists`);
  });
});

describe('switch()', () => {
  const store = new Store<'dev' | 'prod', { foobar: boolean }>('dev', {
    dev: { foobar: true },
    prod: { foobar: false },
  });

  it('should switch env correctly', () => {
    expect(store.is('dev')).toBe(true);
    expect(store.is('prod')).toBe(false);
    const getDev = store.get('foobar');
    expect(getDev).toBe(true);

    store.switch('prod');
    expect(store.is('dev')).toBe(false);
    expect(store.is('prod')).toBe(true);
    const getProd = store.get('foobar');
    expect(getProd).toBe(false);
  });
});
