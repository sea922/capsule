import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { syncVersion } from './sync-version.mjs';

test('release synchronization updates only root version metadata and is repeatable', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'skills-version-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, '.claude-plugin'));
  const put = (path, data) => writeFileSync(join(root, path), JSON.stringify(data));
  const read = (path) => JSON.parse(readFileSync(join(root, path), 'utf8'));
  put('package.json', { version: '1.2.0' });
  put('.claude-plugin/plugin.json', { name: 'sample', version: '1.1.0', skills: ['./skills/example'] });
  put('package-lock.json', { version: '1.1.0', packages: { '': { version: '1.1.0' }, 'node_modules/example': { version: '3.0.0' } } });
  syncVersion(root);
  syncVersion(root);
  assert.equal(read('.claude-plugin/plugin.json').version, '1.2.0');
  assert.deepEqual(read('.claude-plugin/plugin.json').skills, ['./skills/example']);
  assert.equal(read('package-lock.json').packages[''].version, '1.2.0');
  assert.equal(read('package-lock.json').packages['node_modules/example'].version, '3.0.0');
});
