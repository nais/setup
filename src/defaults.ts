import * as core from '@actions/core';
import * as exec from '@actions/exec';
import { NaisCliError } from './types';

export interface NaisDefaults {
  team?: string;
  environment?: string;
}

/**
 * Persists default configuration values using `nais defaults set <key> <value>`.
 */
export async function setDefaults(binaryPath: string, defaults: NaisDefaults): Promise<void> {
  const entries = Object.entries(defaults).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  );

  if (entries.length === 0) {
    return;
  }

  for (const [key, value] of entries) {
    core.info(`Setting default ${key}=${value}...`);
    try {
      await exec.exec(binaryPath, ['defaults', 'set', key, value], { silent: true });
    } catch (error) {
      throw new NaisCliError(
        `Failed to set default ${key}=${value}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  core.info('✅ Defaults set successfully');
}
