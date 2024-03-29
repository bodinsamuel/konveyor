import { Command } from './Command';
import { Konveyor } from './Konveyor';
import { Logger } from './Logger';
import type { Program } from './program';
import { Spinner, exit } from './program';

jest.mock('commander');
jest.mock('./Logger');
jest.mock('./program/exit');
jest.mock('./program/clearConsole');
jest.mock('./program/exit');
jest.mock('./program/spinner');

describe('constructor', () => {
  it('should create a new instance correctly', () => {
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      commands: [],
    });
    expect(knv).toBeInstanceOf(Konveyor);
  });
});

describe('askForCommand()', () => {
  it('should ask for a command', async () => {
    const command1 = new Command({
      name: 'command1',
      description: '',
    });

    const program = {
      choices: jest.fn(() => 'command1'),
    } as unknown as Program;
    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      commands: [command1],
      program,
    });

    await knv.loadCommands();
    await knv.askForCommand();
    expect(program.choices).toHaveBeenCalled();
  });
});

describe('exit()', () => {
  it('should exit(0)', async () => {
    const logger = new Logger();
    const program = {
      spinner: new Spinner({ logger }),
      log: logger,
    } as unknown as Program;

    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      commands: [],
      logger,
      program,
    });

    await knv.exit(0);

    expect(program.spinner.fail).toHaveBeenCalled();
    expect(logger.debug).toHaveBeenCalledWith(`---- Konveyor Exit (0)`);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('should exit(1)', async () => {
    const logger = new Logger();
    const program = {
      spinner: new Spinner({ logger }),
      log: logger,
    } as unknown as Program;

    const knv = new Konveyor({
      name: 'my script',
      version: '1.0',
      commands: [],
      logger,
      program,
    });

    await knv.exit(1);

    expect(program.spinner.fail).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringMatching(/Failed. Check "(.*)" to know more/)
    );
    expect(logger.debug).toHaveBeenCalledWith(`---- Konveyor Exit (1)`);
    expect(exit).toHaveBeenCalledWith(1);
  });
});
