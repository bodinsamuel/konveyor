export async function execParallel<T>(
  promises: Promise<T>[],
  report: () => any,
  reportEvery: number = 1000
): Promise<T[]> {
  const interval = setInterval(report, reportEvery);

  try {
    return await Promise.all<T>(promises);
  } catch (err) {
    clearInterval(interval);
    throw err;
  }
}
