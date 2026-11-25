#!/usr/bin/env node
// Setup entry point for npm prepare; the Python installer owns hook preservation.
import { existsSync, lstatSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const installer = fileURLToPath(new URL('./crew-identity/install_identity_hooks.py', import.meta.url));

function main() {
  // A deployment/package snapshot has no local Git commit boundary. Do not let
  // Git discovery climb into an unrelated enclosing checkout in that case.
  try {
    lstatSync(join(repoRoot, '.git'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('Local commit hooks do not apply: this portal package has no .git metadata. No hooks were installed.');
      return 0;
    }
    console.error(`Hook installation could not inspect Git metadata: ${error.message}`);
    return 2;
  }
  const discovery = spawnSync('git', ['-C', repoRoot, 'rev-parse', '--show-toplevel'], {
    encoding: 'utf8', shell: false, windowsHide: true, timeout: 10_000,
  });
  if (discovery.error || discovery.status !== 0) {
    console.error(`Hook installation could not verify this checkout: ${discovery.error?.message ?? discovery.stderr.trim()}`);
    return 2;
  }
  try {
    const canonical = path => {
      const value = normalize(realpathSync(path));
      return process.platform === 'win32' ? value.toLowerCase() : value;
    };
    if (canonical(discovery.stdout.replace(/\r?\n$/, '')) !== canonical(repoRoot)) {
      console.error('Hook installation refused: Git resolved a different checkout from the portal script location.');
      return 2;
    }
  } catch (error) {
    console.error(`Hook installation could not resolve the checkout path: ${error.message}`);
    return 2;
  }
  if (!existsSync(installer)) {
    console.error(`Hook installation could not run: bundled installer is missing at ${installer}`);
    return 2;
  }

  const candidates = [
    { command: 'python3', prefix: [] },
    { command: 'python', prefix: [] },
    { command: 'py', prefix: ['-3'] },
  ];
  const python = candidates.find(({ command, prefix }) => {
    const probe = spawnSync(command, [...prefix, '-c', 'import sys; sys.exit(0 if sys.version_info[0] >= 3 else 1)'], {
      cwd: repoRoot,
      stdio: 'ignore',
      shell: false,
      windowsHide: true,
      timeout: 10_000,
    });
    return !probe.error && probe.status === 0;
  });
  if (!python) {
    console.error('Hook installation could not run: no working Python 3 interpreter was found (python3, python, py -3).');
    return 2;
  }

  const result = spawnSync(python.command, [...python.prefix, installer, '--repo', repoRoot], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (result.error || result.status === null) {
    console.error(`Hook installation could not run: ${result.error?.message ?? `installer terminated by ${result.signal ?? 'an unknown signal'}`}`);
    return 2;
  }
  return result.status;
}

process.exitCode = main();
