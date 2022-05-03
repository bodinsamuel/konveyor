/* eslint-disable max-classes-per-file */

export class InvalidDirectory extends Error {
  constructor(path: string) {
    super(`Can't autoload commands, "${path}" does not exists`);
  }
}

export class NotADirectory extends Error {
  constructor(path: string) {
    super(`Can't autoload commands, "${path}" is not a directory`);
  }
}

export class ExitError extends Error {
  isExit = true;
  constructor() {
    super(`Exited with error.`);
  }
}

export class NoCommandsError extends Error {
  constructor() {
    super(
      `No commands registered, use "program.commands()" or "commandsPath" to register some commands`
    );
  }
}

export class DuplicateCommandError extends Error {
  constructor(name: string) {
    super(`Command: "${name}" is already registered`);
  }
}

export class CommandUndefinedError extends Error {
  constructor(name: string) {
    super(
      `Command: one dependency of "${name}" is "undefined". This can be due to circular dependency`
    );
  }
}
