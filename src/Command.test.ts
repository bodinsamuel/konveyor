import { Command } from './Command';
import { CommandUndefinedError } from './errors';

jest.mock('./Logger');

describe('constructor', () => {
  it('should create a new instance correctly', () => {
    const command = new Command({
      name: 'my command',
      description: 'my description',
    });
    expect(command).toBeInstanceOf(Command);
    expect(command.isPrivate).toBe(false);
    expect(command.isExecuted).toBe(false);
  });

  it('should set private', () => {
    const command = new Command({
      name: 'my command',
      description: 'my description',
      isPrivate: true,
    });
    expect(command.isPrivate).toBe(true);
  });
});

describe('register', () => {
  it('should register before correctly', () => {
    const command = new Command({
      name: 'my command',
      description: 'my description',
      before: (): void => {},
    });

    expect(command.hasBefore()).toBe(true);
    expect(command.hasExec()).toBe(false);
    expect(command.hasAfter()).toBe(false);
    expect(command.hasAfterAll()).toBe(false);
  });

  it('should register exec correctly', () => {
    const command = new Command({
      name: 'my command',
      description: 'my description',
      exec: (): void => {},
    });

    expect(command.hasBefore()).toBe(false);
    expect(command.hasExec()).toBe(true);
    expect(command.hasAfter()).toBe(false);
    expect(command.hasAfterAll()).toBe(false);
  });

  it('should register after correctly', () => {
    const command = new Command({
      name: 'my command',
      description: 'my description',
      after: (): void => {},
    });

    expect(command.hasBefore()).toBe(false);
    expect(command.hasExec()).toBe(false);
    expect(command.hasAfter()).toBe(true);
    expect(command.hasAfterAll()).toBe(false);
  });

  it('should register afterAll correctly', () => {
    const command = new Command({
      name: 'my command',
      description: 'my description',
      afterAll: (): void => {},
    });

    expect(command.hasBefore()).toBe(false);
    expect(command.hasExec()).toBe(false);
    expect(command.hasAfter()).toBe(false);
    expect(command.hasAfterAll()).toBe(true);
  });

  it('should get all method correctly', () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();
    const afterAll = jest.fn();

    const command = new Command({
      name: 'my command',
      description: 'my description',
      before,
      exec,
      after,
      afterAll,
    });

    expect(command.before).toBe(before);
    expect(command.exec).toBe(exec);
    expect(command.after).toBe(after);
    expect(command.afterAll).toBe(afterAll);
  });
});

describe('dependencies', () => {
  it('should register deps correctly', () => {
    const command1 = new Command({
      name: 'my command',
      description: 'my description',
    });
    const command2 = new Command({
      name: 'my command',
      description: 'my description',
      dependencies: [command1],
    });
    expect(command1.dependencies).toEqual(new Set());
    expect(command2.dependencies).toEqual(new Set([command1]));
  });

  it('should throw on undefined deps', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new Command({
        name: 'my command',
        description: 'my description',
        // @ts-expect-error
        dependencies: [undefined],
      });
    }).toThrow(new CommandUndefinedError('my command'));
  });
});
