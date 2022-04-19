/* eslint-disable max-classes-per-file */
export class ExitError extends Error {
  isExit = true;
  constructor() {
    super(`Exited with error.`);
  }
}

export class NoTasksError extends Error {
  constructor() {
    super(
      `No tasks were registered, use program.tasks() to register your tasks`
    );
  }
}

export class DuplicateTaskError extends Error {
  constructor(name: string) {
    super(`Task: "${name}" is already registered`);
  }
}

export class TaskUndefinedError extends Error {
  constructor(name: string) {
    super(
      `Task: one dependency of "${name}" is undefined, you probably have a circular dependency`
    );
  }
}
