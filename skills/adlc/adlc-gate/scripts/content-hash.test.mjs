import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentHash, reviewedContent } from './content-hash.mjs';

const draft = '---\nadlc: intent\nslug: demo\nstatus: draft\n---\n\n# Intent\n\nKeep private rows private.\n\n## Approvals\n';
const table = '\n| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |\n| --- | --- | --- | --- | --- | --- |\n';
const legacy = (text) => text.replace(/^status:.*\n/gm, '').replace(/^## Approvals[\s\S]*/m, '');

test('preserves existing well-formed LF approval hashes and recording invariance', () => {
  const expected = spawnSync('git', ['hash-object', '--stdin'], { input: legacy(draft), encoding: 'utf8' });
  assert.equal(expected.status, 0);
  const hash = contentHash(draft);
  assert.equal(hash, expected.stdout.trim());
  const approved = draft.replace('status: draft', 'status: approved') + table + `| intent | approved | Jane (owner) | 2026-09-28 | ${hash} | none |\n`;
  assert.equal(contentHash(approved), hash);
  assert.notEqual(contentHash(approved.replace('Keep private', 'Publish private')), hash);
});

test('hashes UTF-8, CRLF and optional BOM consistently', () => {
  const unicode = draft.replace('private rows', 'Joë’s private rows');
  for (const eol of ['\n', '\r\n']) {
    for (const bom of ['', '\uFEFF']) assert.equal(contentHash(bom + unicode.replaceAll('\n', eol)), contentHash(unicode));
  }
});

test('body status and quoted approval headings cannot hide changed requirements', () => {
  for (const marker of ['```', '~~~', '````']) {
    const original = draft.replace('Keep private rows private.', `${marker}text\n## Approvals\nstatus: private\n${marker}\n\nRequire consent.`);
    const changed = original.replace('Require consent.', 'Skip consent.');
    assert.equal(legacy(original), legacy(changed), 'baseline demonstrates hidden changes');
    assert.notEqual(contentHash(original), contentHash(changed));
    assert.notEqual(contentHash(original), contentHash(original.replace('status: private', 'status: public')));
  }
  const original = draft.replace('Keep private rows private.', 'status: private');
  assert.notEqual(contentHash(original), contentHash(original.replace('status: private', 'status: public')));
});

test('rejects ambiguous boundaries instead of returning an approval hash', () => {
  for (const invalid of [
    draft + table + '\n## New requirements\nAllow guests.\n',
    draft + 'Allow guests.\n',
    draft.replace('status: draft', 'status: draft\nstatus: approved'),
    draft.replace('status: draft\n', ''),
    draft.replace('Keep private rows private.', '```text\nUnclosed quotation'),
    draft.replaceAll('\n', '\r'),
    'No frontmatter',
  ]) assert.throws(() => reviewedContent(invalid));
});

test('uses the target repository object format, including SHA-256', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'adlc-hash-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const format of ['sha1', 'sha256']) {
    const cwd = join(root, format);
    const init = spawnSync('git', ['init', `--object-format=${format}`, cwd], { encoding: 'utf8' });
    assert.equal(init.status, 0, init.stderr);
    assert.equal(contentHash(draft, cwd).length, format === 'sha1' ? 40 : 64);
  }
});

test('CLI supports paths with spaces and fails without emitting a hash on malformed input', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'adlc-cli-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const file = join(root, 'an intent.md');
  writeFileSync(file, draft);
  const script = fileURLToPath(new URL('./content-hash.mjs', import.meta.url));
  const run = () => spawnSync(process.execPath, [script, file], { encoding: 'utf8' });
  assert.equal(run().stdout.trim(), contentHash(draft));
  writeFileSync(file, draft + '\nUnhashed behavior');
  const result = run();
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.match(result.stderr, /final section/);
});

test('CLI runs through the directory links used by local skill installations', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'adlc-linked-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const alias = join(root, 'linked skill');
  const script = fileURLToPath(new URL('./content-hash.mjs', import.meta.url));
  try {
    symlinkSync(dirname(script), alias, process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error;
    t.skip(`directory links unavailable: ${error.code}`);
    return;
  }
  const file = join(root, 'intent.md');
  writeFileSync(file, draft);
  const result = spawnSync(process.execPath, [join(alias, 'content-hash.mjs'), file], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), contentHash(draft));
});
