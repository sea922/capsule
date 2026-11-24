import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { commitScope, findSecrets, secretReason } from './block-secret-commit.mjs';

// Fixtures are assembled at run time so this file holds no literal token.
const filler = (length, alphabet = 'aB3dE6gH9jK2mN5pQ8sT1vW4yZ7') => alphabet.repeat(Math.ceil(length / alphabet.length)).slice(0, length);
const upper = (length) => filler(length, 'Q7RXT2MZ9KPL4WNB');
const FIXTURES = {
  'private-key': ['-----BEGIN', 'RSA', 'PRIVATE', 'KEY-----'].join(' '),
  'aws-access-key-id': 'AK' + 'IA' + upper(16),
  'github-token': 'gh' + 'p_' + filler(36),
  'github-fine-grained-token': 'github' + '_pat_' + filler(40),
  'gitlab-token': 'gl' + 'pat-' + filler(20),
  'slack-token': 'xo' + 'xb-' + '1234567890-' + filler(24),
  'stripe-live-key': 'sk' + '_live_' + filler(24),
  'anthropic-api-key': 'sk' + '-ant-' + filler(40),
  'google-api-key': 'AI' + 'za' + filler(35),
  'npm-token': 'np' + 'm_' + filler(36),
};

const diffFor = (file, lines, start = 1) => [
  `diff --git a/${file} b/${file}`,
  `--- a/${file}`,
  `+++ b/${file}`,
  `@@ -${start},0 +${start},${lines.length} @@`,
  ...lines,
].join('\n');

test('each high-confidence pattern is found with its file and line, never its value', () => {
  for (const [pattern, secret] of Object.entries(FIXTURES)) {
    const found = findSecrets(diffFor('src/config.js', ['+const first = 1;', `+const key = "${secret}";`], 10));
    assert.deepEqual(found, [{ file: 'src/config.js', line: 11, pattern }], pattern);
  }
});

test('only added lines count, and line numbers follow context and removals', () => {
  const secret = FIXTURES['github-token'];
  const diff = [
    'diff --git a/a.env b/a.env', '--- a/a.env', '+++ b/a.env', '@@ -3,3 +3,3 @@',
    ' KEEP=1', `-OLD=${secret}`, '+NEW=2', ` CONTEXT=${secret}`,
    'diff --git a/b.env b/b.env', '--- /dev/null', '+++ b/b.env', '@@ -0,0 +1,2 @@', '+A=1', `+TOKEN=${secret}`,
  ].join('\n');
  assert.deepEqual(findSecrets(diff), [{ file: 'b.env', line: 2, pattern: 'github-token' }]);
});

test('generic assignments, placeholders, and documented example keys are not secrets', () => {
  const lines = [
    '+password = "hunter2"',
    '+API_KEY=changeme',
    '+token: ${{ secrets.GITHUB_TOKEN }}',
    `+aws_access_key_id = ${'AK' + 'IA'}IOSFODNN7EXAMPLE`,
    '+ghp_short',
    '+sk_test_' + filler(24),
    '+-----BEGIN PUBLIC KEY-----',
    '+-----BEGIN CERTIFICATE-----',
  ];
  assert.deepEqual(findSecrets(diffFor('notes.md', lines)), []);
});

test('commit scope is read from the command', () => {
  assert.equal(commitScope('git status'), null);
  assert.equal(commitScope('echo git commit -m x'), null);
  assert.equal(commitScope('git commit -m "git add -A"').all, false);
  assert.deepEqual(commitScope('git commit -m x'), { all: false, untracked: false, directory: null });
  assert.deepEqual(commitScope('git commit -am x'), { all: true, untracked: false, directory: null });
  assert.deepEqual(commitScope('git add -A && git commit -m x'), { all: true, untracked: true, directory: null });
  assert.deepEqual(commitScope('git -C sub commit --all -m x'), { all: true, untracked: false, directory: 'sub' });
});

function repository(t) {
  const root = mkdtempSync(join(tmpdir(), 'capsule-secret-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '-q');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Test');
  writeFileSync(join(root, 'README.md'), 'hello\n');
  git('add', '.');
  git('commit', '-q', '-m', 'init');
  return { root, git };
}

const commit = (command, cwd) => ({ tool_name: 'Bash', tool_input: { command }, cwd });

test('a staged secret blocks the commit and the reason names the place, not the value', (t) => {
  const { root, git } = repository(t);
  const secret = FIXTURES['stripe-live-key'];
  writeFileSync(join(root, 'settings.py'), `DEBUG = True\nSTRIPE = "${secret}"\n`);
  assert.equal(secretReason(commit('git commit -m x', root)), null, 'unstaged file is not part of the commit');
  git('add', 'settings.py');
  const reason = secretReason(commit('git commit -m x', root));
  assert.match(reason, /settings\.py:2/);
  assert.match(reason, /stripe-live-key/);
  assert.ok(!reason.includes(secret));
  assert.equal(secretReason(commit('git status', root)), null);
});

test('commit -a covers tracked edits and a preceding git add covers new files', (t) => {
  const { root } = repository(t);
  writeFileSync(join(root, 'README.md'), `hello\n${FIXTURES['gitlab-token']}\n`);
  assert.equal(secretReason(commit('git commit -m x', root)), null);
  assert.match(secretReason(commit('git commit -am x', root)), /README\.md:2/);
  writeFileSync(join(root, 'README.md'), 'hello\n');
  writeFileSync(join(root, '.env'), `A=1\nB=2\nKEY=${FIXTURES['aws-access-key-id']}\n`);
  assert.equal(secretReason(commit('git commit -am x', root)), null);
  assert.match(secretReason(commit('git add . && git commit -m x', root)), /\.env:3/);
});

test('outside a repository the commit is allowed', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'capsule-norepo-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  assert.equal(secretReason(commit('git commit -m x', root)), null);
});

test('the script blocks with exit 2, allows with exit 0, and honours the off switch', (t) => {
  const { root, git } = repository(t);
  writeFileSync(join(root, 'key.txt'), `${FIXTURES['private-key']}\n`);
  git('add', 'key.txt');
  const script = fileURLToPath(new URL('./block-secret-commit.mjs', import.meta.url));
  const run = (command, env = {}) => spawnSync(process.execPath, [script], {
    input: JSON.stringify(commit(command, root)), encoding: 'utf8',
    env: { ...process.env, CAPSULE_HOOKS_DISABLED: '', ...env },
  });
  const block = run('git commit -m x');
  assert.equal(block.status, 2);
  assert.match(block.stderr, /key\.txt:1 private-key/);
  assert.equal(run('git log').status, 0);
  assert.equal(run('git commit -m x', { CAPSULE_HOOKS_DISABLED: 'block-secret-commit' }).status, 0);
  assert.equal(spawnSync(process.execPath, [script], { input: 'not json', encoding: 'utf8' }).status, 0);
});

test('the first commit of a new repository is still checked', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'capsule-first-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q'], { cwd: root });
  writeFileSync(join(root, 'token.txt'), `${FIXTURES['npm-token']}\n`);
  execFileSync('git', ['add', '.'], { cwd: root });
  assert.match(secretReason(commit('git commit -am init', root)), /token\.txt:1 npm-token/);
});
