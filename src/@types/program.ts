import type { ExecaChildProcess } from 'execa';

export type Exec = (command: string) => ExecaChildProcess<string>;
