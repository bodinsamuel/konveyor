import { prompt } from 'enquirer';

import type { Logger } from '../Logger';

export function createYesNo(logger: Logger) {
  return async function yesno(question: string): Promise<boolean> {
    logger.debug(`Asking yes or no: "${question}"`);

    const answer = await prompt<{ question: boolean }>({
      type: 'toggle',
      message: question,
      name: 'question',
    });

    logger.debug(`Got answer: "${answer.question}"`);
    return answer.question;
  };
}
