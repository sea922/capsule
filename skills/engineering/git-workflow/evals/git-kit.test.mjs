import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { parseWorktreesPorcelain } from '../scripts/git-kit.mjs';

const SCRIPT = path.resolve(import.meta.dirname, '..', 'scripts', 'git-kit.mjs');
const ASSETS = path.resolve(import.meta.dirname, '..', 'assets');

function createSandbox(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'git-kit-'));
  const hooksPath = path.join(root, 'hooks');
  const globalConfig = path.join(root, 'global.gitconfig');
  const systemConfig = path.join(root, 'system.gitconfig');
  mkdirSync(hooksPath);
  writeFileSync(globalConfig, '');
  writeFileSync(systemConfig, '');
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !/^GIT_/i.test(key)),
  );
  Object.assign(env, {
    GIT_AUTHOR_EMAIL: 'git-kit@example.invalid',
    GIT_AUTHOR_NAME: 'Git Kit',
    GIT_CONFIG_GLOBAL: globalConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_SYSTEM: systemConfig,
    GIT_COMMITTER_EMAIL: 'git-kit@example.invalid',
    GIT_COMMITTER_NAME: 'Git Kit',
    GIT_TERMINAL_PROMPT: '0',
    HOME: root,
    USERPROFILE: root,
    XDG_CONFIG_HOME: root,
  });
  t.after(() => {
    const resolvedRoot = path.resolve(root);
    assert.equal(path.dirname(resolvedRoot), path.resolve(os.tmpdir()));
    assert.match(path.basename(resolvedRoot), /^git-kit-/);
    if (existsSync(resolvedRoot)) rmSync(resolvedRoot, { recursive: true, force: true });
    assert.equal(existsSync(resolvedRoot), false);
  });
  return { env, hooksPath, root };
}

function runGit(sandbox, cwd, args, { allowFailure = false } = {}) {
  const result = spawnSync(
    'git',
    ['-c', `core.hooksPath=${sandbox.hooksPath}`, ...args],
    {
      cwd,
      encoding: 'utf8',
      env: sandbox.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 15_000,
      windowsHide: true,
    },
  );
  if (result.error) throw result.error;
  const status = result.status ?? -1;
  if (!allowFailure && status !== 0) {
    throw new Error(`git ${args.join(' ')} failed (${status}): ${result.stderr}`);
  }
  return {
    status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function git(sandbox, cwd, args) {
  return runGit(sandbox, cwd, args).stdout.trim();
}

function runKit(sandbox, cwd, args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd,
    encoding: 'utf8',
    env: sandbox.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 20_000,
    windowsHide: true,
  });
  if (result.error) throw result.error;
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function writeRepoFile(repository, relativePath, contents) {
  const target = path.join(repository, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function commitAll(sandbox, repository, message) {
  git(sandbox, repository, ['add', '--all']);
  git(sandbox, repository, ['commit', '--message', message]);
  return git(sandbox, repository, ['rev-parse', 'HEAD']);
}

function createRepository(sandbox) {
  const repository = path.join(sandbox.root, 'repo');
  mkdirSync(repository);
  git(sandbox, repository, ['init', '--initial-branch=main']);
  writeRepoFile(repository, 'README.md', 'base\n');
  const main = commitAll(sandbox, repository, 'base');
  git(sandbox, repository, ['switch', '--create', 'release']);
  writeRepoFile(repository, 'release.txt', 'release\n');
  const release = commitAll(sandbox, repository, 'release');
  git(sandbox, repository, ['switch', '--create', 'feature']);
  writeRepoFile(repository, 'feature-one.txt', 'one\n');
  const featureOne = commitAll(sandbox, repository, 'feature one');
  writeRepoFile(repository, 'feature-two.txt', 'two\n');
  const featureTwo = commitAll(sandbox, repository, 'feature two');
  return { feature: featureTwo, featureOne, main, release, repository };
}

test('status reports parsed changes and worktree inventory', (t) => {
  const sandbox = createSandbox(t);
  const { repository, feature } = createRepository(sandbox);
  writeRepoFile(repository, 'staged.txt', 'staged\n');
  git(sandbox, repository, ['add', 'staged.txt']);
  writeRepoFile(repository, 'feature-one.txt', 'one changed\n');
  const weirdPath = 'literal [brackets] & spaces.txt';
  writeRepoFile(repository, weirdPath, 'untracked\n');

  const result = runKit(sandbox, sandbox.root, ['status', '--repo', repository]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.root, path.resolve(repository));
  assert.equal(payload.head, feature);
  assert.equal(payload.branch, 'feature');
  assert.ok(payload.changes.some((entry) => entry.path === 'staged.txt' && entry.index === 'A'));
  assert.ok(payload.changes.some((entry) => entry.path === 'feature-one.txt' && entry.worktree === 'M'));
  assert.ok(payload.changes.some((entry) => entry.path === weirdPath));
  assert.equal(payload.worktrees.length, 1);
  assert.equal(payload.worktrees[0].path, path.resolve(repository));
  assert.equal(payload.worktrees[0].head, feature);
  assert.deepEqual(Object.keys(payload).sort(), ['branch', 'changes', 'head', 'root', 'worktrees']);
});

test('status parses staged renames and Unicode paths', (t) => {
  const sandbox = createSandbox(t);
  const { repository } = createRepository(sandbox);
  git(sandbox, repository, ['mv', 'README.md', 'lisez-moi é.md']);
  const result = runKit(sandbox, sandbox.root, ['status', '--repo', repository]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).changes, [{
    index: 'R',
    worktree: ' ',
    path: 'lisez-moi é.md',
    originalPath: 'README.md',
  }]);
});

test('status on an unborn branch names the missing commit', (t) => {
  const sandbox = createSandbox(t);
  const repository = path.join(sandbox.root, 'empty');
  mkdirSync(repository);
  git(sandbox, repository, ['init', '--initial-branch=main']);
  const result = runKit(sandbox, sandbox.root, ['status', '--repo', repository]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HEAD has no commit/);
});

test('CLI runs when invoked through a linked skill directory', (t) => {
  const sandbox = createSandbox(t);
  const link = path.join(sandbox.root, 'linked-skill');
  symlinkSync(path.resolve(import.meta.dirname, '..'), link, 'junction');
  const result = spawnSync(process.execPath, [path.join(link, 'scripts', 'git-kit.mjs'), '--help'], {
    encoding: 'utf8',
    env: sandbox.env,
    timeout: 20_000,
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /status \[--repo PATH\]/);
});

test('status reports null branch for detached HEAD', (t) => {
  const sandbox = createSandbox(t);
  const { repository, feature } = createRepository(sandbox);
  git(sandbox, repository, ['switch', '--detach', feature]);
  const result = runKit(sandbox, sandbox.root, ['status', '--repo', repository]);
  assert.equal(result.status, 0, result.stderr);
  const payload = JSON.parse(result.stdout);
  assert.equal(payload.head, feature);
  assert.equal(payload.branch, null);
});

test('worktree porcelain parser preserves newline-bearing fields', () => {
  const parsed = parseWorktreesPorcelain(
    'worktree C:/repo\nwith-newline\0HEAD abc\0branch refs/heads/main\0\0',
  );
  assert.deepEqual(parsed, [{
    path: path.resolve('C:/repo\nwith-newline'),
    head: 'abc',
    branch: 'main',
  }]);
});

test('invalid argument shapes fail clearly', (t) => {
  const sandbox = createSandbox(t);
  const { repository } = createRepository(sandbox);
  const positional = runKit(sandbox, sandbox.root, ['status', 'extra']);
  assert.notEqual(positional.status, 0);
  assert.match(positional.stderr, /Unexpected positional argument/);

  const duplicate = runKit(sandbox, sandbox.root, ['status', '--repo', repository, '--repo', repository]);
  assert.notEqual(duplicate.status, 0);
  assert.match(duplicate.stderr, /duplicate/i);
});

test('template output is allowlisted, literal-path safe, and exclusive', (t) => {
  const sandbox = createSandbox(t);
  const outputName = 'literal [output] & spaces.md';
  const outputPath = path.join(sandbox.root, outputName);
  const expected = readFileSync(path.join(ASSETS, 'commit.txt'), 'utf8');
  const written = runKit(sandbox, sandbox.root, ['template', 'commit.txt', '--output', outputName]);
  assert.equal(written.status, 0, written.stderr);
  assert.equal(written.stdout, '');
  assert.equal(readFileSync(outputPath, 'utf8'), expected);

  const overwrite = runKit(sandbox, sandbox.root, ['template', 'commit.txt', '--output', outputName]);
  assert.notEqual(overwrite.status, 0);
  assert.match(overwrite.stderr, /Unable to create template output/i);
  assert.equal(readFileSync(outputPath, 'utf8'), expected);

  const traversal = runKit(sandbox, sandbox.root, ['template', '../commit.txt']);
  assert.notEqual(traversal.status, 0);
  assert.match(traversal.stderr, /unknown template/i);

  const missingParent = runKit(sandbox, sandbox.root, [
    'template', 'commit.txt', '--output', path.join('missing', 'nested.txt'),
  ]);
  assert.notEqual(missingParent.status, 0);
  assert.equal(existsSync(path.join(sandbox.root, 'missing')), false);

  const stdoutTemplate = runKit(sandbox, sandbox.root, ['template', 'commit.txt']);
  assert.equal(stdoutTemplate.status, 0, stdoutTemplate.stderr);
  assert.equal(stdoutTemplate.stdout, readFileSync(path.join(ASSETS, 'commit.txt'), 'utf8'));
});

test('filled commit templates commit without guidance comments', (t) => {
  const sandbox = createSandbox(t);
  const { repository } = createRepository(sandbox);
  for (const name of ['commit.txt', 'commit-conventional.txt']) {
    const messageFile = path.join(sandbox.root, name);
    const created = runKit(sandbox, sandbox.root, ['template', name, '--output', messageFile]);
    assert.equal(created.status, 0, created.stderr);
    const lines = readFileSync(messageFile, 'utf8').split('\n');
    lines[0] = `Record ${name}`;
    writeFileSync(messageFile, lines.join('\n'));
    writeRepoFile(repository, `${name}.log`, 'x\n');
    git(sandbox, repository, ['add', `${name}.log`]);
    git(sandbox, repository, [
      '-c', 'core.commentChar=#', 'commit', '--file', messageFile, '--cleanup=strip',
    ]);
    assert.equal(git(sandbox, repository, ['log', '-1', '--format=%B']), `Record ${name}`);
  }
});

test('help is available and unknown flags do not run Git', (t) => {
  const sandbox = createSandbox(t);
  const help = runKit(sandbox, sandbox.root, ['--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /template NAME/);
  const commandHelp = runKit(sandbox, sandbox.root, ['status', '--help']);
  assert.equal(commandHelp.status, 0);
  assert.match(commandHelp.stdout, /status \[--repo PATH\]/);
  const unknown = runKit(sandbox, sandbox.root, ['status', '--wat']);
  assert.notEqual(unknown.status, 0);
  assert.match(unknown.stderr, /not valid|unknown flag/i);
});
