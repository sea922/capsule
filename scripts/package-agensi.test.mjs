import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { SCRIPT_DISCLOSURES, packageAll, readFrontmatter, toListingBody } from './package-agensi.mjs';

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
  writeSkill(root, 'bucket/adlc-gate', {
    'SKILL.md': skillMd('adlc-gate'),
    'references/APPROVALS.md': 'approvals',
    'scripts/content-hash.mjs': 'export {}',
    'scripts/content-hash.test.mjs': 'test',
    'evals/evals.json': '{}',
  });
  writeSkill(root, 'bucket/flow', {
    'SKILL.md': skillMd('flow', 'Read [the contract](../adlc-gate/references/APPROVALS.md#top).'),
  });
  return root;
}

test('packageAll_siblingLink_putsSkillMdAtRootAndVendorsSibling', () => {
  const root = makeRepo();
  const results = packageAll(root);
  const flow = results.find(({ name }) => name === 'flow');

  assert.deepEqual(flow.vendored, ['adlc-gate']);
  assert.deepEqual(unzipList(flow.zipPath), [
    'LICENSE', 'SKILL.md', 'vendor/', 'vendor/adlc-gate/', 'vendor/adlc-gate/references/',
    'vendor/adlc-gate/references/APPROVALS.md', 'vendor/adlc-gate/scripts/', 'vendor/adlc-gate/scripts/content-hash.mjs',
  ]);
  assert.match(unzipRead(flow.zipPath, 'SKILL.md'), /\(vendor\/adlc-gate\/references\/APPROVALS\.md#top\)/);
});

test('packageAll_devArtifacts_areExcluded', () => {
  const root = makeRepo();
  const gate = packageAll(root).find(({ name }) => name === 'adlc-gate');

  assert.deepEqual(unzipList(gate.zipPath), [
    'LICENSE', 'SKILL.md', 'references/', 'references/APPROVALS.md', 'scripts/', 'scripts/content-hash.mjs',
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

test('packageAll_bundledScript_listingDisclosesItsExternalAccess', () => {
  const root = makeRepo();
  const flow = packageAll(root).find(({ name }) => name === 'flow');
  const listing = readFileSync(flow.listingPath, 'utf8');

  assert.ok(listing.includes(SCRIPT_DISCLOSURES['adlc-gate/scripts/content-hash.mjs']));
  assert.match(listing, /`vendor\/adlc-gate\/scripts\/content-hash\.mjs`/);
  assert.match(listing, /## Short description\n\nDoes flow\./);
});

test('packageAll_docsPage_becomesLongDescription', () => {
  const root = makeRepo();
  mkdirSync(join(root, 'docs/bucket'), { recursive: true });
  writeFileSync(join(root, 'docs/bucket/flow.md'), '# Flow\n\nRoutes work end to end.\n');
  const flow = packageAll(root).find(({ name }) => name === 'flow');

  assert.match(readFileSync(flow.listingPath, 'utf8'), /## Long description\n\nRoutes work end to end\.\n/);
});

test('packageAll_undisclosedScript_throws', () => {
  const root = makeRepo();
  writeSkill(root, 'sneaky', { 'SKILL.md': skillMd('sneaky'), 'scripts/upload.py': 'pass' });

  assert.throws(() => packageAll(root), /sneaky\/scripts\/upload\.py: bundled script has no entry/);
});

test('toListingBody_internalSectionsAndRelativeLinks_areRemoved', () => {
  const page = '# Tdd\n\nSee [the guide](../workflow.md) and [docs](https://x.dev).\n\n## Example\n\nRun it.\n\n## Attribution and design basis\n\nFrom upstream.\n';

  assert.equal(toListingBody(page), 'See the guide and [docs](https://x.dev).\n\n### Example\n\nRun it.');
});

test('toListingBody_provenanceParagraphs_areDroppedWithEmptiedHeadings', () => {
  const page = '# Ship\n\nShips work.\n\n## Composition\n\nAdapted from Superpowers.\n\n## Examples\n\nShip it.\n';

  assert.equal(toListingBody(page), 'Ships work.\n\n### Examples\n\nShip it.');
});
