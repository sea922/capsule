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
    `+apiKey: "${'AI' + 'za' + filler(35)}"`,
  ];
  assert.deepEqual(findSecrets(diffFor('notes.md', lines)), []);
});

test('commit scope is read from the command', () => {
  assert.equal(commitScope('git status'), null);
  assert.equal(commitScope('echo git commit -m x'), null);
  assert.equal(commitScope('git add secrets.txt'), null);
  assert.equal(commitScope(5), null);
  assert.equal(commitScope('git commit -m "git add -A"').all, false);
  assert.deepEqual(commitScope('git commit -m x'), { all: false, add: null, directory: null });
  assert.deepEqual(commitScope('git commit -am x'), { all: true, add: null, directory: null });
  assert.deepEqual(commitScope('git -C sub commit --all -m x'), { all: true, add: null, directory: 'sub' });
  assert.deepEqual(commitScope('git commit README.md -m x'), { all: true, add: null, directory: null });
  assert.deepEqual(commitScope('git commit -m x -- docs/a.md'), { all: true, add: null, directory: null });
  assert.deepEqual(commitScope('git add -A && git commit -m x'), { all: true, add: { paths: [':/'], force: false }, directory: null });
  assert.deepEqual(commitScope('git add . && git commit -m x'), { all: true, add: { paths: ['.'], force: false }, directory: null });
  assert.deepEqual(commitScope('git add a.txt "b c.txt" && git commit -m x'), { all: true, add: { paths: ['a.txt', 'b c.txt'], force: false }, directory: null });
  assert.deepEqual(commitScope('git add -f .env; git commit -m x'), { all: true, add: { paths: ['.env'], force: true }, directory: null });
  assert.deepEqual(commitScope('git add -u && git commit -m x'), { all: true, add: { paths: [], force: false }, directory: null });
  assert.deepEqual(commitScope('(git commit -m x)'), { all: false, add: null, directory: null });
  assert.deepEqual(commitScope('bash -c "git commit -am x"'), { all: true, add: null, directory: null });
});

test('file headers are only read from the diff header, and paths come out clean', () => {
  const secret = FIXTURES['github-token'];
  const stored = [
    'diff --git a/saved.patch b/saved.patch', '--- a/saved.patch', '+++ b/saved.patch', '@@ -1,2 +1,2 @@',
    '--- old', '+++ fake', `+TOKEN=${secret}`,
  ].join('\n');
  assert.deepEqual(findSecrets(stored), [{ file: 'saved.patch', line: 2, pattern: 'github-token' }]);
  const spaced = ['diff --git "a/my file.txt" "b/my file.txt"', '--- /dev/null', '+++ "b/my file.txt"\t', '@@ -0,0 +1 @@', `+${secret}`].join('\n');
  assert.deepEqual(findSecrets(spaced), [{ file: 'my file.txt', line: 1, pattern: 'github-token' }]);
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

test('a git add of named paths scans those paths only, and -f reaches ignored files', (t) => {
  const { root } = repository(t);
  writeFileSync(join(root, 'notes.txt'), 'plain\n');
  writeFileSync(join(root, 'scratch.txt'), `${FIXTURES['slack-token']}\n`);
  assert.equal(secretReason(commit('git add notes.txt && git commit -m x', root)), null, 'an unrelated untracked file does not block');
  assert.match(secretReason(commit('git add scratch.txt && git commit -m x', root)), /scratch\.txt:1 slack-token/);
  assert.match(secretReason(commit('git add -A && git commit -m x', root)), /scratch\.txt:1/);
  rmSync(join(root, 'scratch.txt'));
  writeFileSync(join(root, '.gitignore'), '.env\n');
  writeFileSync(join(root, '.env'), `KEY=${FIXTURES['anthropic-api-key']}\n`);
  assert.equal(secretReason(commit('git add . && git commit -m x', root)), null, 'an ignored file is not added by git add .');
  assert.match(secretReason(commit('git add -f .env && git commit -m x', root)), /\.env:1 anthropic-api-key/);
});

test('a pathspec commit of an unstaged tracked file is checked', (t) => {
  const { root } = repository(t);
  writeFileSync(join(root, 'README.md'), `hello\n${FIXTURES['gitlab-token']}\n`);
  assert.equal(secretReason(commit('git commit -m x', root)), null);
  assert.match(secretReason(commit('git commit README.md -m x', root)), /README\.md:2 gitlab-token/);
});

test('paths with spaces and non-ASCII names are reported readably', (t) => {
  const { root, git } = repository(t);
  writeFileSync(join(root, 'my filé.txt'), `${FIXTURES['npm-token']}\n`);
  git('add', '.');
  assert.match(secretReason(commit('git commit -m x', root)), /\n {2}my filé\.txt:1 npm-token\n/);
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
  for (const input of ['', 'null', '{}', '{"tool_name":"Bash"}', '{"tool_name":"Bash","tool_input":null}',
    '{"tool_name":"Bash","tool_input":{"command":5}}', '{"tool_name":"Bash","tool_input":{"command":"git commit -m x"},"cwd":7}']) {
    assert.equal(spawnSync(process.execPath, [script], { input, encoding: 'utf8', cwd: tmpdir() }).status, 0, input);
  }
});

test('the first commit of a new repository is still checked', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'capsule-first-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q'], { cwd: root });
  writeFileSync(join(root, 'token.txt'), `${FIXTURES['npm-token']}\n`);
  execFileSync('git', ['add', '.'], { cwd: root });
  assert.match(secretReason(commit('git commit -am init', root)), /token\.txt:1 npm-token/);
});

test('when the time budget is spent the commit is allowed', (t) => {
  const { root, git } = repository(t);
  writeFileSync(join(root, 'key.txt'), `${FIXTURES['private-key']}\n`);
  git('add', 'key.txt');
  assert.ok(secretReason(commit('git commit -m x', root)));
  assert.equal(secretReason(commit('git commit -m x', root), 0), null);
});
