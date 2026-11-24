import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import type * as coreModule from '@actions/core';
import type * as execModule from '@actions/exec';
import type * as tcModule from '@actions/tool-cache';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { PlatformInfo, ReleaseInfo } from '../types';

// Mock the external dependencies (ESM requires unstable_mockModule + dynamic imports)
jest.unstable_mockModule('@actions/core', () => ({
  addPath: jest.fn(),
  info: jest.fn(),
  setFailed: jest.fn(),
  warning: jest.fn(),
  debug: jest.fn(),
  error: jest.fn(),
}));
jest.unstable_mockModule('@actions/tool-cache', () => ({
  downloadTool: jest.fn(),
  extractTar: jest.fn(),
}));
jest.unstable_mockModule('@actions/exec', () => ({
  exec: jest.fn(),
}));

const { downloadAndInstall } = await import('../installer');
const mockCore = (await import('@actions/core')) as jest.Mocked<typeof coreModule>;
const mockExec = (await import('@actions/exec')) as jest.Mocked<typeof execModule>;
const mockTc = (await import('@actions/tool-cache')) as jest.Mocked<typeof tcModule>;

describe('Installer', () => {
  const originalEnv = process.env;
  let tmpDir: string;
  let installDir: string;
  let targetPath: string;
  let binaryPath: string;

  const mockReleaseInfo: ReleaseInfo = {
    tagName: 'v3.8.3',
    assets: [
      {
        name: 'nais-cli_linux_amd64.tgz',
        downloadUrl:
          'https://github.com/nais/cli/releases/download/v3.8.3/nais-cli_linux_amd64.tgz',
      },
      {
        name: 'checksums.txt',
        downloadUrl: 'https://github.com/nais/cli/releases/download/v3.8.3/checksums.txt',
      },
    ],
  };

  const mockPlatformInfo: PlatformInfo = {
    os: 'linux',
    arch: 'amd64',
    filename: 'nais-cli_linux_amd64.tgz',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nais-installer-'));
    const home = path.join(tmpDir, 'home');
    process.env = {
      ...originalEnv,
      HOME: home,
      NODE_ENV: 'production',
      NAIS_CLI_DRY_RUN: 'false',
      GITHUB_ACTIONS: 'true',
    };
    installDir = path.join(home, '.local', 'bin');
    targetPath = path.join(installDir, 'nais');

    const archivePath = path.join(tmpDir, mockPlatformInfo.filename);
    fs.writeFileSync(archivePath, 'test');
    const checksumsPath = path.join(tmpDir, 'checksums.txt');
    fs.writeFileSync(
      checksumsPath,
      '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08  ./release_artifacts/nais-cli_linux_amd64.tgz\n'
    );
    const extractedPath = path.join(tmpDir, 'extracted');
    fs.mkdirSync(extractedPath);
    binaryPath = path.join(extractedPath, 'nais');
    fs.writeFileSync(binaryPath, 'new nais binary');

    mockTc.downloadTool.mockResolvedValueOnce(archivePath).mockResolvedValueOnce(checksumsPath);
    mockTc.extractTar.mockResolvedValue(extractedPath);
    mockExec.exec.mockImplementation(async (_commandLine, _args, options) => {
      options?.listeners?.stdout?.(Buffer.from('nais version v3.8.3'));
      return 0;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('atomically replaces an existing executable and cleans up', async () => {
    fs.mkdirSync(installDir, { recursive: true });
    fs.writeFileSync(targetPath, 'old nais binary', { mode: 0o755 });
    const oldFd = fs.openSync(targetPath, 'r');

    try {
      const result = await downloadAndInstall(mockReleaseInfo, mockPlatformInfo);

      expect(fs.readFileSync(oldFd, 'utf8')).toBe('old nais binary');
      expect(fs.readFileSync(targetPath)).toEqual(fs.readFileSync(binaryPath));
      expect(fs.statSync(targetPath).mode & 0o777).toBe(0o755);
      expect(fs.readdirSync(installDir)).toEqual(['nais']);
      expect(result.binaryPath).toBe(targetPath);
      expect(result.version).toBe('v3.8.3');
      expect(result.dryRun).toBe(false);
      expect(mockCore.addPath).toHaveBeenCalledWith(installDir);
    } finally {
      fs.closeSync(oldFd);
    }
  });

  it('leaves the destination intact and cleans up if replacement fails', async () => {
    fs.mkdirSync(targetPath, { recursive: true });

    await expect(downloadAndInstall(mockReleaseInfo, mockPlatformInfo)).rejects.toThrow(
      'Installation failed'
    );

    expect(fs.readdirSync(targetPath)).toEqual([]);
    expect(fs.readdirSync(installDir)).toEqual(['nais']);
    expect(mockCore.addPath).not.toHaveBeenCalled();
  });

  describe('Dry Run Mode', () => {
    it('should run in dry-run mode when NODE_ENV is test', async () => {
      process.env.NODE_ENV = 'test';

      const result = await downloadAndInstall(mockReleaseInfo, mockPlatformInfo);

      // In dry-run mode, should not copy to permanent location
      expect(fs.existsSync(installDir)).toBe(false);
      expect(mockCore.addPath).not.toHaveBeenCalled();

      // Should still verify the binary works
      expect(mockExec.exec).toHaveBeenCalledWith(binaryPath, ['--version'], expect.any(Object));

      // Should log dry-run message
      expect(mockCore.info).toHaveBeenCalledWith(
        '🧪 Running in dry-run mode - skipping permanent installation'
      );

      // Should return temporary path
      expect(result.binaryPath).toBe(binaryPath);
      expect(result.version).toBe('v3.8.3');
    });

    it('should run in dry-run mode when NAIS_CLI_DRY_RUN is true', async () => {
      process.env.NAIS_CLI_DRY_RUN = 'true';

      const result = await downloadAndInstall(mockReleaseInfo, mockPlatformInfo);

      expect(fs.existsSync(installDir)).toBe(false);
      expect(mockCore.addPath).not.toHaveBeenCalled();
      expect(mockCore.info).toHaveBeenCalledWith(
        '🧪 Running in dry-run mode - skipping permanent installation'
      );
      expect(result.binaryPath).toBe(binaryPath);
    });
  });
});
