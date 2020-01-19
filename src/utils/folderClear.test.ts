jest.mock('rimraf');
jest.mock('../Logger');
import { Logger } from '../Logger';
import { createFolderClear } from './folderClear';

describe('folderClear()', () => {
  const logger = new Logger({ folder: '' });
  it('should clear the folder', async () => {
    await createFolderClear(logger)('/foobar');

    expect(logger.debug).toHaveBeenCalledWith(`Clearing folder: "/foobar"`);
    expect(logger.debug).toHaveBeenCalledWith(`Folder cleared`);
  });
});
