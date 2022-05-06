import type { DirMapping } from './@types/parser';
import { Command } from './Command';
import { Config } from './Config';
import { Logger } from './Logger';
import { Runner } from './Runner';
import { defaultRootCommand } from './helpers/RootCommand';
import { createValidationPlan } from './parser/createValidationPlan';
import {
  getExecutionPlan,
  isExecutionPlanValid,
} from './parser/getExecutionPlan';
import { parseArgv } from './parser/parseArgv';
import { Program } from './program';

jest.mock('./Logger');

const prgm = new Program({ logger: new Logger() });
const config = new Config({ configs: { dev: {} }, defaultEnv: 'dev' });
const rootCommand = defaultRootCommand;

function getRunner(
  commands: Command<any>[],
  argv: string[] = ['command']
): Runner<any> {
  commands.push(defaultRootCommand);
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
  const validationPlan = createValidationPlan(dirMapping);
  const validatedPlan = getExecutionPlan(parsed, validationPlan);
  if (!isExecutionPlanValid(validatedPlan)) {
    throw new Error('invalid plan');
  }

  return new Runner({
    program: prgm,
    config,
    rootCommand,
    validatedPlan: validatedPlan.plan,
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

    expect(exec).toHaveBeenCalledTimes(0);
    expect(skipped).toHaveBeenCalled();
    expect(stop).toHaveBeenCalledTimes(1);
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

    expect(start).toHaveBeenCalledTimes(3);
    expect(stop).toHaveBeenCalledTimes(3);
    expect(start).toHaveBeenNthCalledWith(1, [{ command: defaultRootCommand }]);
    expect(start).toHaveBeenNthCalledWith(2, [{ command: command1 }]);
    expect(start).toHaveBeenNthCalledWith(3, [{ command: command2 }]);
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

    expect(start).toHaveBeenCalledTimes(4);
    expect(stop).toHaveBeenCalledTimes(4);
  });
});
