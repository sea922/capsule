import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { availableSets, installRules } from './install.mjs';

const RULES_ROOT = dirname(fileURLToPath(import.meta.url));
const EXPECTED_SETS = ['common', 'csharp', 'golang', 'java', 'python', 'react', 'typescript', 'web'];

function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'capsule-rules-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('the shipped sets are the eight expected ones', () => {
  assert.deepEqual(availableSets(), EXPECTED_SETS);
});

test('a dry run reports what it would create and writes nothing', (t) => {
  const target = project(t);
  const result = installRules({ target, sets: ['common', 'golang'] });
  assert.equal(result.dryRun, true);
  assert.ok(result.wouldCreate.length > 1);
  assert.ok(result.wouldCreate.every((path) => path.startsWith(join(target, '.claude', 'rules', 'capsule'))));
  assert.equal(existsSync(join(target, '.claude')), false);
});

test('apply copies only the chosen sets and a repeat run changes nothing', (t) => {
  const target = project(t);
  const first = installRules({ target, sets: ['common', 'python'], apply: true });
  assert.equal(first.created.length, first.planned);
  const installed = join(target, '.claude', 'rules', 'capsule');
  assert.deepEqual(readdirSync(installed).sort(), ['common', 'python']);
  assert.equal(readFileSync(join(installed, 'python', 'python.md'), 'utf8'), readFileSync(join(RULES_ROOT, 'python', 'python.md'), 'utf8'));
  const second = installRules({ target, sets: ['common', 'python'], apply: true });
  assert.equal(second.created.length, 0);
  assert.equal(second.unchanged.length, first.planned);
});

test('a file the project changed is never overwritten and nothing else is written', (t) => {
  const target = project(t);
  const edited = join(target, '.claude', 'rules', 'capsule', 'golang', 'golang.md');
  mkdirSync(dirname(edited), { recursive: true });
  writeFileSync(edited, 'our own Go rules\n');
  assert.throws(() => installRules({ target, sets: ['common', 'golang'], apply: true }), /golang\.md/);
  assert.equal(readFileSync(edited, 'utf8'), 'our own Go rules\n');
  assert.equal(existsSync(join(target, '.claude', 'rules', 'capsule', 'common')), false);
});

test('unknown sets and a missing target are rejected', (t) => {
  const target = project(t);
  assert.throws(() => installRules({ target, sets: ['cobol'] }), /cobol/);
  assert.throws(() => installRules({ target: join(target, 'missing'), sets: ['common'] }), /target/);
});

test('the command line defaults to a dry run of the common set', (t) => {
  const target = project(t);
  const script = join(RULES_ROOT, 'install.mjs');
  const run = spawnSync(process.execPath, [script, '--target', target], { encoding: 'utf8' });
  assert.equal(run.status, 0);
  assert.match(run.stdout, /dry run/i);
  assert.equal(existsSync(join(target, '.claude')), false);
  const applied = spawnSync(process.execPath, [script, '--target', target, '--sets', 'common,web', '--apply'], { encoding: 'utf8' });
  assert.equal(applied.status, 0);
  assert.deepEqual(readdirSync(join(target, '.claude', 'rules', 'capsule')).sort(), ['common', 'web']);
});

test('every rule is short, stack rules are path-scoped, and common rules always load', () => {
  for (const set of EXPECTED_SETS) {
    const files = readdirSync(join(RULES_ROOT, set)).filter((name) => name.endsWith('.md'));
    assert.ok(files.length > 0, `${set} has no rules`);
    for (const name of files) {
      const text = readFileSync(join(RULES_ROOT, set, name), 'utf8');
      assert.ok(text.split('\n').length <= 80, `${set}/${name} is longer than 80 lines`);
      const scoped = /^---\npaths:\n(?:  - ".+"\n)+---\n/.test(text);
      assert.equal(scoped, set !== 'common', `${set}/${name} path scoping is wrong`);
    }
  }
});
