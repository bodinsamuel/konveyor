/* eslint-disable max-classes-per-file */

export class InvalidDirectory extends Error {
  constructor(path: string) {
    super(`Can't autoload tasks, "${path}" does not exists`);
  }
}

export class NotADirectory extends Error {
  constructor(path: string) {
    super(`Can't autoload tasks, "${path}" is not a directory`);
  }
}

export class ExitError extends Error {
  isExit = true;
  constructor() {
    super(`Exited with error.`);
  }
}

export class NoTasksError extends Error {
  constructor() {
    super(
      `No tasks registered, use "program.tasks()" or "tasksPath" to register some tasks`
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
      `Task: one dependency of "${name}" is "undefined". This can be due to circular dependency`
    );
  }
}
