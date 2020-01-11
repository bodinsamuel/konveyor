export class ExitError extends Error {}

export class NoTasksError extends Error {
  public constructor() {
    super(
      `No tasks were registered, use program.tasks() to register your tasks`
    );
  }
}

export class DuplicateTaskError extends Error {
  public constructor(name: string) {
    super(`Task: "${name}" is already registered`);
  }
}

export class TaskUndefinedError extends Error {
  public constructor(name: string) {
    super(
      `Task: one dependency of "${name}" is undefined, you probably have a circular dependency`
    );
  }
}
