import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function syncVersion(root) {
  const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error('package.json must have a valid release version');
  }
  const manifestPath = join(root, '.claude-plugin/plugin.json');
  const lockPath = join(root, 'package-lock.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
  if (!lock.packages?.['']) throw new Error('package-lock.json is missing its root package');
  manifest.version = version;
  lock.version = version;
  lock.packages[''].version = version;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n');
  return version;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Synchronized plugin and lockfile to ${syncVersion(resolve(dirname(fileURLToPath(import.meta.url)), '..'))}`);
}
