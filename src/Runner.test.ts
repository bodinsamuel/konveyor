import { Command } from './Command';
import { Config } from './Config';
import { Logger } from './Logger';
import { Program } from './Program';
import { Runner } from './Runner';

jest.mock('./Logger');

const prgm = new Program({ logger: new Logger({ folder: './' }) });
const config = new Config({ configs: { dev: {} }, defaultEnv: 'dev' });

describe('run()', () => {
  it('should run everything correctly', async () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();

    const command = new Command({
      name: 'my command',
      description: 'my description',
      before,
      exec,
      after,
    });

    const runner = new Runner({ program: prgm, command, config });
    await runner.run();

    expect(before).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
  });

  it('should receive event', async () => {
    const exec = jest.fn();
    const start = jest.fn();
    const skipped = jest.fn();
    const stop = jest.fn();

    const command = new Command({
      name: 'my command',
      description: 'my description',
      exec,
    });

    const runner = new Runner({ program: prgm, command, config });
    runner.once('command:start', start);
    runner.once('command:skipped', skipped);
    runner.once('command:stop', stop);
    await runner.run();

    expect(exec).toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
    expect(skipped).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it('should skip correctly', async () => {
    const exec = jest.fn();
    const skipped = jest.fn();
    const stop = jest.fn();

    const command = new Command({
      name: 'my command',
      description: 'my description',
      before: (): any => {
        return { skip: true };
      },
      exec,
    });

    const runner = new Runner({ program: prgm, command, config });
    runner.once('command:skipped', skipped);
    runner.once('command:stop', stop);
    await runner.run();

    expect(exec).not.toHaveBeenCalled();
    expect(skipped).toHaveBeenCalled();
    expect(stop).not.toHaveBeenCalled();
  });
});

describe('hooks', () => {
  it('should run before/after correctly', async () => {
    const before = jest.fn();
    const exec = jest.fn();
    const after = jest.fn();

    const command = new Command({
      name: 'command',
      description: 'my description',
      before,
      exec,
      after,
    });

    const runner = new Runner({ program: prgm, command, config });
    await runner.run();

    expect(before).toHaveBeenCalled();
    expect(exec).toHaveBeenCalled();
    expect(after).toHaveBeenCalled();
  });

  it('should register afterAll and run it', async () => {
    const exec = jest.fn();
    const afterAll = jest.fn();

    const command = new Command({
      name: 'command',
      description: 'my description',
      exec,
      afterAll,
    });

    const runner = new Runner({ program: prgm, command, config });
    await runner.run();

    expect(exec).toHaveBeenCalled();
    expect(afterAll).not.toHaveBeenCalled();

    await runner.afterAll();
    expect(afterAll).toHaveBeenCalled();
  });
});

describe('dependencies', () => {
  it('should run deps correctly', async () => {
    const command1 = new Command({
      name: 'command1',
      description: 'my description',
    });
    const command2 = new Command({
      name: 'command2',
      description: 'my description',
      dependencies: [command1],
    });

    const start = jest.fn();
    const stop = jest.fn();

    const runner = new Runner({ program: prgm, command: command2, config });
    runner.on('command:start', start);
    runner.on('command:stop', stop);
    await runner.run();

    expect(start).toHaveBeenCalledTimes(2);
    expect(stop).toHaveBeenCalledTimes(2);
    expect(start).toHaveBeenNthCalledWith(1, [{ command: command1 }]);
    expect(start).toHaveBeenNthCalledWith(2, [{ command: command2 }]);
  });

  it('should run 1 deps correctly and ignore it the second time', async () => {
    const command1 = new Command({
      name: 'command1',
      description: 'my description',
    });
    const command2 = new Command({
      name: 'command2',
      description: 'my description',
      dependencies: [command1],
    });
    const command3 = new Command({
      name: 'command3',
      description: 'my description',
      dependencies: [command1, command2],
    });

    const start = jest.fn();
    const stop = jest.fn();

    const runner = new Runner({ program: prgm, command: command3, config });
    runner.on('command:start', start);
    runner.on('command:stop', stop);
    await runner.run();

    expect(start).toHaveBeenCalledTimes(3);
    expect(stop).toHaveBeenCalledTimes(3);
  });
});
