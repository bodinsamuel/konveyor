import figures from 'figures';
import * as kolorist from 'kolorist';

import { Command } from './Command';
import { Konveyor } from './Konveyor';
import { Logger } from './Logger';
import type { Program } from './Program';
import { NoCommandsError, DuplicateCommandError } from './errors';
import { Spinner, exit } from './utils';

jest.mock('commander');
jest.mock('./Logger');
jest.mock('./utils/exit');
jest.mock('./utils/clearConsole');
jest.mock('./utils/intro');
jest.mock('./utils/exit');
jest.mock('./utils/spinner');

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

// describe('registerCommands()', () => {
//   it('should throw correctly when no commands', () => {
//     const knv = new Konveyor({
//       name: 'my script',
//       version: '1.0',
//       commands: [],
//     });

//     expect(() => {
//       knv.registerCommands();
//     }).toThrow(new NoCommandsError());
//   });

//   it('should throw correctly when duplicate commands', () => {
//     const command = new Command({
//       name: 'command',
//       description: '',
//     });
//     const knv = new Konveyor({
//       name: 'my script',
//       version: '1.0',
//       commands: [command, command],
//     });

//     expect(() => {
//       knv.registerCommands();
//     }).toThrow(new DuplicateCommandError('command'));
//   });

//   it('should register correctly', () => {
//     const command1 = new Command({
//       name: 'command1',
//       description: '',
//     });
//     const command2 = new Command({
//       name: 'command2',
//       description: '',
//     });
//     const knv = new Konveyor({
//       name: 'my script',
//       version: '1.0',
//       commands: [command1, command2],
//     });

//     knv.registerCommands();
//     expect(knv.commandsPublic).toEqual([command1, command2]);
//   });
// });

// describe('askForCommand()', () => {
//   it('should ask for a command', async () => {
//     const command1 = new Command({
//       name: 'command1',
//       description: '',
//     });

//     const program = {
//       choices: jest.fn(() => 'command1'),
//     } as unknown as Program;
//     const knv = new Konveyor({
//       name: 'my script',
//       version: '1.0',
//       commands: [command1],
//       program,
//     });

//     knv.registerCommands();
//     await knv.askForCommand();
//     expect(program.choices).toHaveBeenCalled();
//     // expect(knv.pickedCommand).toBe(command1);
//   });
// });

describe('exit()', () => {
  it('should exit(0)', async () => {
    const logger = new Logger({ folder: '/' });
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
    expect(logger.info).toHaveBeenCalledWith(
      `${kolorist.magenta(figures.heart)} my script done.`
    );
    expect(logger.debug).toHaveBeenCalledWith(`---- Konveyor Exit (0)`);
    expect(exit).toHaveBeenCalledWith(0);
  });

  it('should exit(1)', async () => {
    const logger = new Logger({ folder: '/' });
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
      `${kolorist.red(
        figures.squareSmallFilled
      )} Failed. Check "debug.log" to know more`
    );
    expect(logger.debug).toHaveBeenCalledWith(`---- Konveyor Exit (1)`);
    expect(exit).toHaveBeenCalledWith(1);
  });
});
