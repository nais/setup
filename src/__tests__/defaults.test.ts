import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { setDefaults } from '../defaults';
import { NaisCliError } from '../types';

jest.mock('@actions/core');

describe('setDefaults', () => {
  let tmpDir: string;
  let originalEnv: typeof process.env;

  beforeEach(() => {
    originalEnv = process.env;
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nais-defaults-'));
    process.env = { ...originalEnv, XDG_CONFIG_HOME: tmpDir };
  });

  afterEach(() => {
    process.env = originalEnv;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const configPath = (): string => path.join(tmpDir, 'nais', 'config.yaml');

  it('does nothing when no defaults are provided', () => {
    setDefaults({});
    expect(fs.existsSync(configPath())).toBe(false);
  });

  it('writes only non-empty values', () => {
    setDefaults({ team: '', environment: 'dev' });
    expect(fs.readFileSync(configPath(), 'utf8')).toBe('environment: "dev"\n');
  });

  it('writes team and environment', () => {
    setDefaults({ team: 'myteam', environment: 'prod' });
    expect(fs.readFileSync(configPath(), 'utf8')).toBe('team: "myteam"\nenvironment: "prod"\n');
  });

  it('creates the config directory if it does not exist', () => {
    expect(fs.existsSync(path.join(tmpDir, 'nais'))).toBe(false);
    setDefaults({ team: 'myteam' });
    expect(fs.existsSync(configPath())).toBe(true);
  });

  it('throws NaisCliError when the file cannot be written', () => {
    // Make the target a file so creating the "nais" directory fails.
    fs.writeFileSync(path.join(tmpDir, 'nais'), 'not a dir');
    expect(() => setDefaults({ team: 'myteam' })).toThrow(NaisCliError);
  });
});
