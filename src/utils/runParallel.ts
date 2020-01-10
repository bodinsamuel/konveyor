export async function runParallel<TReturn>(
  promises: Promise<TReturn>[],
  report: () => any,
  reportEvery: number = 1000
): Promise<TReturn[]> {
  const interval = setInterval(report, reportEvery);

  try {
    return await Promise.all<TReturn>(promises);
  } catch (err) {
    clearInterval(interval);
    throw err;
  }
}
