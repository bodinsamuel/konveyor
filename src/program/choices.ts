import { prompt } from 'enquirer';

import type { Logger } from '../Logger';

// Copied from enquirer/index.d.ts because they do not export it
export type Choice = {
  name: string;
  message?: string;
  value?: string;
  hint?: string;
  disabled?: boolean | string;
};

export function createChoices(logger: Logger) {
  return async function list<T>(
    question: string,
    choices: Choice[]
  ): Promise<T> {
    logger.debug(`Asking question: "${question}"`);

    const answers = await prompt<{ question: T }>({
      type: 'select',
      name: 'question',
      message: question,
      choices,
    });

    logger.debug(`Got answer: "${answers.question}"`);
    return answers.question;
  };
}
