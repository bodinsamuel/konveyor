import inquirer = require('inquirer');
import { Logger } from '../Logger';

export function createChoices(logger: Logger) {
  return async function choices<T extends string>(
    question: string,
    choices: T[]
  ): Promise<T> {
    logger.debug(`asking ${question}`);

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'question',
        message: question,
        choices: choices,
      },
    ]);

    logger.debug(`got answer ${answers.question}`);
    return answers.question;
  };
}
