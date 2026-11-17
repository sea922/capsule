import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { packageAll, readFrontmatter } from './package-agensi.mjs';

function writeSkill(root, relativeDir, files) {
  for (const [path, content] of Object.entries(files)) {
    const target = join(root, 'skills', relativeDir, path);
    mkdirSync(join(target, '..'), { recursive: true });
    writeFileSync(target, content);
  }
}

const skillMd = (name, body = '') => `---\nname: ${name}\ndescription: Does ${name}.\n---\n${body}\n`;
const unzipList = (zipPath) => execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).trim().split('\n').sort();
const unzipRead = (zipPath, entry) => execFileSync('unzip', ['-p', zipPath, entry], { encoding: 'utf8' });

function makeRepo() {
  const root = mkdtempSync(join(tmpdir(), 'agensi-'));
  writeFileSync(join(root, 'LICENSE'), 'MIT');
  writeSkill(root, 'bucket/gate', {
    'SKILL.md': skillMd('gate'),
    'references/APPROVALS.md': 'approvals',
    'scripts/hash.mjs': 'export {}',
    'scripts/hash.test.mjs': 'test',
    'evals/evals.json': '{}',
  });
  writeSkill(root, 'bucket/flow', {
    'SKILL.md': skillMd('flow', 'Read [the contract](../gate/references/APPROVALS.md#top).'),
  });
  return root;
}

test('packageAll_siblingLink_putsSkillMdAtRootAndVendorsSibling', () => {
  const root = makeRepo();
  const results = packageAll(root);
  const flow = results.find(({ name }) => name === 'flow');

  assert.deepEqual(flow.vendored, ['gate']);
  assert.deepEqual(unzipList(flow.zipPath), [
    'LICENSE', 'SKILL.md', 'vendor/', 'vendor/gate/', 'vendor/gate/references/',
    'vendor/gate/references/APPROVALS.md', 'vendor/gate/scripts/', 'vendor/gate/scripts/hash.mjs',
  ]);
  assert.match(unzipRead(flow.zipPath, 'SKILL.md'), /\(vendor\/gate\/references\/APPROVALS\.md#top\)/);
});

test('packageAll_devArtifacts_areExcluded', () => {
  const root = makeRepo();
  const gate = packageAll(root).find(({ name }) => name === 'gate');

  assert.deepEqual(unzipList(gate.zipPath), [
    'LICENSE', 'SKILL.md', 'references/', 'references/APPROVALS.md', 'scripts/', 'scripts/hash.mjs',
  ]);
});

test('readFrontmatter_missingDescription_throws', () => {
  const root = mkdtempSync(join(tmpdir(), 'agensi-'));
  writeSkill(root, 'broken', { 'SKILL.md': '---\nname: broken\n---\n' });

  assert.throws(() => readFrontmatter(join(root, 'skills/broken/SKILL.md')), /non-empty description/);
});

test('readFrontmatter_nameDiffersFromDirectory_throws', () => {
  const root = mkdtempSync(join(tmpdir(), 'agensi-'));
  writeSkill(root, 'actual', { 'SKILL.md': skillMd('other') });

  assert.throws(() => readFrontmatter(join(root, 'skills/actual/SKILL.md')), /differs from its directory/);
});
