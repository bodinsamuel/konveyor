export default (
  _path: string,
  callback: () => Record<string, unknown>
): Record<string, unknown> => {
  return callback();
};
