import inquirer = require('inquirer');
import { Logger } from '../Logger';

export function creatYesNo(logger: Logger) {
  return async function yesno<T extends string>(question: string): Promise<T> {
    logger.debug(`Asking yes or no: "${question}"`);

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'answer',
        message: question,
      },
    ]);

    logger.debug(`Got answer: "${answers.answer}"`);
    return answers.answer;
  };
}
