import { Command } from './Command';
import { Config } from './Config';
import { Logger } from './Logger';
import { Program } from './Program';
import { Runner } from './Runner';
import { defaultRootCommand } from './helpers/RootCommand';
import { fsToValidationPlan } from './parser/fsToValidationPlan';
import { getExecutionPlan } from './parser/getExecutionPlan';
import type { DirMapping } from './parser/loadCommandsFromFs';
import { parseArgv } from './parser/parseArgv';

jest.mock('./Logger');

const prgm = new Program({ logger: new Logger({ folder: './' }) });
const config = new Config({ configs: { dev: {} }, defaultEnv: 'dev' });
const rootCommand = defaultRootCommand;

function getRunner(
  commands: Command<any>[],
  argv: string[] = ['command']
): Runner<any> {
  const dirMapping: DirMapping = {
    dirPath: '/',
    isTopic: false,
    paths: [],
    subs: [],
    cmds: commands.map((cmd) => {
      return {
        basename: cmd.name,
        cmd,
        paths: [],
      };
    }),
  };
  const parsed = parseArgv(['node', 'cli.js', ...argv]).flat;
  const validationPlan = fsToValidationPlan(dirMapping);
  const validatedPlan = getExecutionPlan(parsed, validationPlan);
  // console.log({ parsed, dirMapping, validatedPlan, validationPlan });

  return new Runner({
    program: prgm,
    config,
    rootCommand,
    dirMapping,
    validatedPlan: validatedPlan.plan,
    validationPlan,
  });
}

describe('start()', () => {
  it('should run everything correctly', async () => {
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

    const runner = getRunner([command]);
    await runner.start();

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
      name: 'command',
      description: 'my description',
      exec,
    });

    const runner = getRunner([command]);
    runner.once('command:run', start);
    runner.once('command:skipped', skipped);
    runner.once('command:stop', stop);
    await runner.start();

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
      name: 'command',
      description: 'my description',
      before: (): any => {
        return { skip: true };
      },
      exec,
    });

    const runner = getRunner([command]);
    runner.once('command:skipped', skipped);
    runner.once('command:stop', stop);
    await runner.start();

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

    const runner = getRunner([command]);
    await runner.start();

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

    const runner = getRunner([command]);
    await runner.start();

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

    const runner = getRunner([command2, command1], ['command2']);
    runner.on('command:run', start);
    runner.on('command:stop', stop);
    await runner.start();

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

    const runner = getRunner([command3, command2, command1], ['command3']);
    runner.on('command:run', start);
    runner.on('command:stop', stop);
    await runner.start();

    expect(start).toHaveBeenCalledTimes(3);
    expect(stop).toHaveBeenCalledTimes(3);
  });
});
