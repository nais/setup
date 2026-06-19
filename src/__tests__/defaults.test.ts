import { setDefaults } from '../defaults';
import { NaisCliError } from '../types';

jest.mock('@actions/core');
jest.mock('@actions/exec');

import * as exec from '@actions/exec';

const mockExec = exec as jest.Mocked<typeof exec>;

describe('setDefaults', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockExec.exec.mockResolvedValue(0);
  });

  it('does nothing when no defaults are provided', async () => {
    await setDefaults('/usr/local/bin/nais', {});
    expect(mockExec.exec).not.toHaveBeenCalled();
  });

  it('skips empty values', async () => {
    await setDefaults('/usr/local/bin/nais', { team: '', environment: 'dev' });
    expect(mockExec.exec).toHaveBeenCalledTimes(1);
    expect(mockExec.exec).toHaveBeenCalledWith(
      '/usr/local/bin/nais',
      ['defaults', 'set', 'environment', 'dev'],
      expect.anything()
    );
  });

  it('sets team and environment', async () => {
    await setDefaults('/usr/local/bin/nais', { team: 'myteam', environment: 'prod' });
    expect(mockExec.exec).toHaveBeenCalledTimes(2);
    expect(mockExec.exec).toHaveBeenCalledWith(
      '/usr/local/bin/nais',
      ['defaults', 'set', 'team', 'myteam'],
      expect.anything()
    );
    expect(mockExec.exec).toHaveBeenCalledWith(
      '/usr/local/bin/nais',
      ['defaults', 'set', 'environment', 'prod'],
      expect.anything()
    );
  });

  it('throws NaisCliError when the CLI fails', async () => {
    mockExec.exec.mockRejectedValue(new Error('unknown command "defaults"'));
    await expect(setDefaults('/usr/local/bin/nais', { team: 'myteam' })).rejects.toThrow(
      NaisCliError
    );
  });
});
