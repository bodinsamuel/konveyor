export const SymbolExit0 = Symbol('exit0');
export const SymbolExit1 = Symbol('exit1');
export type SymbolExit = typeof SymbolExit0 | typeof SymbolExit1;

export function exit(code: 0 | 1): SymbolExit {
  if (code === 0) return SymbolExit0;
  return SymbolExit1;
}
