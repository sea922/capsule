import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readZip, writeZip } from './zip-archive.mjs';

test('writeZip_utf8Files_roundTripThroughReadZip', () => {
  const dir = mkdtempSync(join(tmpdir(), 'zip-'));
  writeFileSync(join(dir, 'a.md'), '# Tiếng Việt\n');
  writeFileSync(join(dir, 'b.mjs'), 'export {};\n'.repeat(200));
  const zipPath = join(dir, 'out.zip');

  writeZip(zipPath, [{ name: 'scripts/b.mjs', path: join(dir, 'b.mjs') }, { name: 'SKILL.md', path: join(dir, 'a.md') }]);

  assert.deepEqual([...readZip(zipPath)], [['SKILL.md', '# Tiếng Việt\n'], ['scripts/b.mjs', 'export {};\n'.repeat(200)]]);
});

test('writeZip_sameInput_producesIdenticalBytes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'zip-'));
  writeFileSync(join(dir, 'a.md'), 'same');
  writeZip(join(dir, 'one.zip'), [{ name: 'a.md', path: join(dir, 'a.md') }]);
  writeZip(join(dir, 'two.zip'), [{ name: 'a.md', path: join(dir, 'a.md') }]);

  assert.deepEqual(readFileSync(join(dir, 'one.zip')), readFileSync(join(dir, 'two.zip')));
});
