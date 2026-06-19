import * as core from '@actions/core';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { NaisCliError } from './types';

export interface NaisDefaults {
  team?: string;
  environment?: string;
}

/**
 * Returns the path to the nais CLI config file, mirroring naistrix's use of
 * os.UserConfigDir() + "/nais/config.yaml". This action only runs on Linux, so
 * the base is $XDG_CONFIG_HOME or $HOME/.config.
 */
function configFilePath(): string {
  const base =
    process.env.XDG_CONFIG_HOME || path.join(process.env.HOME || os.homedir(), '.config');
  return path.join(base, 'nais', 'config.yaml');
}

/**
 * Persists default configuration values to the nais CLI config file.
 *
 * We write the file directly rather than shelling out to `nais defaults set`,
 * because that command prompts interactively to create the config directory
 * when it does not exist, which hangs forever on a non-interactive CI runner.
 */
export function setDefaults(defaults: NaisDefaults): void {
  const entries = Object.entries(defaults).filter(
    (entry): entry is [string, string] => Boolean(entry[1])
  );

  if (entries.length === 0) {
    return;
  }

  const filePath = configFilePath();

  try {
    // JSON-encode values so any value is a valid YAML scalar (YAML is a JSON superset).
    const contents = entries.map(([key, value]) => `${key}: ${JSON.stringify(value)}\n`).join('');

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);

    for (const [key, value] of entries) {
      core.info(`Set default ${key}=${value}`);
    }
    core.info(`✅ Wrote nais defaults to ${filePath}`);
  } catch (error) {
    throw new NaisCliError(
      `Failed to write nais defaults to ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}
