import { afterAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type * as coreModule from '@actions/core';

jest.unstable_mockModule('@actions/core', () => ({
  getInput: jest.fn(),
  info: jest.fn(),
}));

const { getReleaseInfo } = await import('../github');
const http = await import('@actions/http-client');
const mockCore = (await import('@actions/core')) as jest.Mocked<typeof coreModule>;

describe('GitHub release lookup', () => {
  const getJson = jest.spyOn(http.HttpClient.prototype, 'getJson');

  beforeEach(() => {
    jest.resetAllMocks();
    getJson.mockResolvedValue({
      statusCode: 200,
      result: {
        tag_name: 'v3.8.3',
        assets: [{ name: 'checksums.txt', browser_download_url: 'https://example.com/checksums' }],
      },
      headers: {},
    });
  });

  afterAll(() => {
    getJson.mockRestore();
  });

  it('fetches the latest release with the job token without caller configuration', async () => {
    mockCore.getInput.mockReturnValue('job-token');

    await expect(getReleaseInfo('latest')).resolves.toEqual({
      tagName: 'v3.8.3',
      assets: [{ name: 'checksums.txt', downloadUrl: 'https://example.com/checksums' }],
    });
    expect(getJson).toHaveBeenCalledWith('https://api.github.com/repos/nais/cli/releases/latest', {
      Authorization: 'Bearer job-token',
    });
  });

  it('fetches a specific release with the supplied token', async () => {
    mockCore.getInput.mockReturnValue('custom-token');

    await getReleaseInfo('v3.8.3');

    expect(getJson).toHaveBeenCalledWith(
      'https://api.github.com/repos/nais/cli/releases/tags/v3.8.3',
      { Authorization: 'Bearer custom-token' }
    );
  });

  it('can fetch public releases without a token outside GitHub Actions', async () => {
    mockCore.getInput.mockReturnValue('');

    await getReleaseInfo('latest');

    expect(getJson).toHaveBeenCalledWith(
      'https://api.github.com/repos/nais/cli/releases/latest',
      undefined
    );
  });
});
