import path from 'path';

export function toAbsolute(file: string, base: string): string {
  return path.isAbsolute(file) ? file : path.join(base, file);
}
