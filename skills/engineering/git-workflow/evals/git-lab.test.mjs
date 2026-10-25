import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

function createSandbox() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'git-lab-'));
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
    GIT_AUTHOR_EMAIL: 'git-lab@example.invalid',
    GIT_AUTHOR_NAME: 'Git Lab',
    GIT_CONFIG_GLOBAL: globalConfig,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_SYSTEM: systemConfig,
    GIT_COMMITTER_EMAIL: 'git-lab@example.invalid',
    GIT_COMMITTER_NAME: 'Git Lab',
    GIT_TERMINAL_PROMPT: '0',
    HOME: root,
    USERPROFILE: root,
    XDG_CONFIG_HOME: root,
  });

  return { env, hooksPath, root };
}

function removeSandbox(sandbox) {
  const resolvedRoot = path.resolve(sandbox.root);
  const resolvedTemp = path.resolve(os.tmpdir());
  assert.notEqual(resolvedRoot, resolvedTemp);
  assert.equal(path.dirname(resolvedRoot), resolvedTemp);
  assert.match(path.basename(resolvedRoot), /^git-lab-/);
  assert.equal(lstatSync(resolvedRoot).isSymbolicLink(), false);

  rmSync(resolvedRoot, { force: true, maxRetries: 3, recursive: true, retryDelay: 50 });
  assert.equal(existsSync(resolvedRoot), false);
}

function sandboxForTest(t) {
  const sandbox = createSandbox();
  t.after(() => removeSandbox(sandbox));
  return sandbox;
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
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  const output = `${stdout}${stderr}`;
  if (!allowFailure && status !== 0) {
    throw new Error(`git ${args.join(' ')} failed with ${status}:\n${output}`);
  }
  return { output, status, stderr, stdout };
}

function git(sandbox, cwd, args) {
  return runGit(sandbox, cwd, args).stdout.trim();
}

function initRepository(sandbox, repository) {
  mkdirSync(repository, { recursive: true });
  git(sandbox, repository, ['init', '--initial-branch=main']);
}

function writeRepositoryFile(repository, relativePath, contents) {
  const target = path.join(repository, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function commitAll(sandbox, repository, message) {
  git(sandbox, repository, ['add', '--all']);
  git(sandbox, repository, ['commit', '--message', message]);
  return git(sandbox, repository, ['rev-parse', 'HEAD']);
}

test('path-scoped commit preserves unrelated staged changes', (t) => {
  const sandbox = sandboxForTest(t);
  const repository = path.join(sandbox.root, 'repo');
  initRepository(sandbox, repository);
  writeRepositoryFile(repository, 'src/feature.txt', 'before\n');
  writeRepositoryFile(repository, 'docs/notes.md', 'before\n');
  commitAll(sandbox, repository, 'seed repository');

  writeRepositoryFile(repository, 'src/feature.txt', 'feature change\n');
  writeRepositoryFile(repository, 'docs/notes.md', 'unrelated staged change\n');
  git(sandbox, repository, ['add', 'docs/notes.md', 'src/feature.txt']);
  const unrelatedIndexBlob = git(sandbox, repository, ['rev-parse', ':docs/notes.md']);

  assert.equal(
    git(sandbox, repository, ['status', '--short']),
    'M  docs/notes.md\nM  src/feature.txt',
  );
  git(sandbox, repository, ['commit', '--message', 'commit feature path', '--', 'src/feature.txt']);

  assert.equal(git(sandbox, repository, ['show', '--format=', '--name-only', 'HEAD']), 'src/feature.txt');
  assert.equal(git(sandbox, repository, ['status', '--short']), 'M  docs/notes.md');
  assert.equal(git(sandbox, repository, ['diff', '--cached', '--name-only']), 'docs/notes.md');
  assert.equal(git(sandbox, repository, ['rev-parse', ':docs/notes.md']), unrelatedIndexBlob);
  assert.equal(readFileSync(path.join(repository, 'docs/notes.md'), 'utf8'), 'unrelated staged change\n');
});

test('branch rescues a commit made from detached HEAD', (t) => {
  const sandbox = sandboxForTest(t);
  const repository = path.join(sandbox.root, 'repo');
  initRepository(sandbox, repository);
  writeRepositoryFile(repository, 'README.md', 'base\n');
  commitAll(sandbox, repository, 'seed repository');

  git(sandbox, repository, ['switch', '--detach', 'HEAD']);
  writeRepositoryFile(repository, 'detached.txt', 'work from detached HEAD\n');
  const detachedHash = commitAll(sandbox, repository, 'detached work');
  const detachedState = runGit(
    sandbox,
    repository,
    ['symbolic-ref', '--quiet', '--short', 'HEAD'],
    { allowFailure: true },
  );
  assert.notEqual(detachedState.status, 0);

  git(sandbox, repository, ['switch', '--create', 'rescue/detached-work']);

  assert.equal(git(sandbox, repository, ['branch', '--show-current']), 'rescue/detached-work');
  assert.equal(git(sandbox, repository, ['rev-parse', 'HEAD']), detachedHash);
  assert.equal(git(sandbox, repository, ['status', '--porcelain']), '');
});

test('explicit force-with-lease rejects a concurrent local remote update', (t) => {
  const sandbox = sandboxForTest(t);
  const remote = path.join(sandbox.root, 'origin.git');
  const seed = path.join(sandbox.root, 'seed');
  const alice = path.join(sandbox.root, 'alice');
  const bob = path.join(sandbox.root, 'bob');

  git(sandbox, sandbox.root, ['init', '--bare', '--initial-branch=main', remote]);
  initRepository(sandbox, seed);
  writeRepositoryFile(seed, 'README.md', 'base\n');
  commitAll(sandbox, seed, 'seed repository');
  git(sandbox, seed, ['remote', 'add', 'origin', remote]);
  git(sandbox, seed, ['push', '--set-upstream', 'origin', 'main']);

  git(sandbox, sandbox.root, ['clone', remote, alice]);
  git(sandbox, sandbox.root, ['clone', remote, bob]);
  const expectedRemoteHash = git(sandbox, alice, ['rev-parse', 'refs/remotes/origin/main']);

  writeRepositoryFile(alice, 'README.md', 'alice change\n');
  const aliceHash = commitAll(sandbox, alice, 'alice change');
  assert.equal(git(sandbox, alice, ['rev-parse', 'refs/remotes/origin/main']), expectedRemoteHash);

  writeRepositoryFile(bob, 'README.md', 'bob change\n');
  const bobHash = commitAll(sandbox, bob, 'bob change');
  git(sandbox, bob, ['push', 'origin', 'HEAD:refs/heads/main']);

  git(sandbox, alice, ['fetch', 'origin']);
  assert.equal(git(sandbox, alice, ['rev-parse', 'refs/remotes/origin/main']), bobHash);

  const push = runGit(
    sandbox,
    alice,
    [
      'push',
      `--force-with-lease=refs/heads/main:${expectedRemoteHash}`,
      'origin',
      'HEAD:refs/heads/main',
    ],
    { allowFailure: true },
  );
  assert.notEqual(push.status, 0);
  assert.match(push.output, /rejected|stale info|failed/i);
  assert.equal(git(sandbox, remote, ['rev-parse', 'refs/heads/main']), bobHash);
  assert.notEqual(git(sandbox, remote, ['rev-parse', 'refs/heads/main']), aliceHash);
});

test('rebase --onto preserves child commits after a parent squash merge', (t) => {
  const sandbox = sandboxForTest(t);
  const repository = path.join(sandbox.root, 'repo');
  initRepository(sandbox, repository);
  writeRepositoryFile(repository, 'README.md', 'base\n');
  commitAll(sandbox, repository, 'seed repository');

  git(sandbox, repository, ['switch', '--create', 'parent']);
  writeRepositoryFile(repository, 'parent.txt', 'parent change\n');
  const oldParentTip = commitAll(sandbox, repository, 'parent change');

  git(sandbox, repository, ['switch', '--create', 'child']);
  writeRepositoryFile(repository, 'child-one.txt', 'first child change\n');
  const originalChildOne = commitAll(sandbox, repository, 'child one');
  writeRepositoryFile(repository, 'child-two.txt', 'second child change\n');
  const originalChildTwo = commitAll(sandbox, repository, 'child two');

  git(sandbox, repository, ['switch', 'main']);
  git(sandbox, repository, ['merge', '--squash', 'parent']);
  const newBase = commitAll(sandbox, repository, 'squash parent');

  git(sandbox, repository, ['rebase', '--onto', 'main', oldParentTip, 'child']);
  git(sandbox, repository, ['switch', 'child']);

  assert.equal(git(sandbox, repository, ['rev-parse', 'main']), newBase);
  assert.equal(git(sandbox, repository, ['rev-list', '--count', 'main..child']), '2');
  assert.equal(
    git(sandbox, repository, ['log', '--format=%s', '--reverse', 'main..child']),
    'child one\nchild two',
  );
  assert.equal(
    git(sandbox, repository, ['diff', '--name-only', 'main...child']),
    'child-one.txt\nchild-two.txt',
  );
  assert.equal(git(sandbox, repository, ['show', '--format=', '--name-only', originalChildOne]), 'child-one.txt');
  assert.equal(git(sandbox, repository, ['show', '--format=', '--name-only', originalChildTwo]), 'child-two.txt');
  assert.notEqual(git(sandbox, repository, ['rev-parse', 'child~1']), originalChildOne);
  assert.notEqual(git(sandbox, repository, ['rev-parse', 'child']), originalChildTwo);
  assert.equal(git(sandbox, repository, ['rev-parse', 'parent']), oldParentTip);
  assert.equal(git(sandbox, repository, ['status', '--porcelain']), '');
});

test('aborting a conflicted merge restores the initially clean checkout', (t) => {
  const sandbox = sandboxForTest(t);
  const repository = path.join(sandbox.root, 'repo');
  initRepository(sandbox, repository);
  writeRepositoryFile(repository, 'shared.txt', 'base\n');
  commitAll(sandbox, repository, 'base');
  git(sandbox, repository, ['switch', '--create', 'feature']);
  writeRepositoryFile(repository, 'shared.txt', 'feature\n');
  const featureTip = commitAll(sandbox, repository, 'feature edit');
  git(sandbox, repository, ['switch', 'main']);
  writeRepositoryFile(repository, 'shared.txt', 'main\n');
  const before = commitAll(sandbox, repository, 'main edit');
  const merge = runGit(sandbox, repository, ['merge', 'feature'], { allowFailure: true });
  assert.equal(merge.status, 1);
  assert.equal(git(sandbox, repository, ['rev-parse', 'MERGE_HEAD']), featureTip);
  assert.match(git(sandbox, repository, ['status', '--porcelain']), /UU shared.txt/);
  git(sandbox, repository, ['merge', '--abort']);
  assert.equal(git(sandbox, repository, ['rev-parse', 'HEAD']), before);
  assert.equal(git(sandbox, repository, ['status', '--porcelain']), '');
  assert.equal(readFileSync(path.join(repository, 'shared.txt'), 'utf8'), 'main\n');
  assert.notEqual(runGit(sandbox, repository, ['rev-parse', '--verify', 'MERGE_HEAD'],
    { allowFailure: true }).status, 0);
});

test('squash merge leaves feature ancestry separate and worktree removal keeps branch', (t) => {
  const sandbox = sandboxForTest(t);
  const repository = path.join(sandbox.root, 'repo');
  const featureWorktree = path.join(sandbox.root, 'feature-worktree');
  initRepository(sandbox, repository);
  writeRepositoryFile(repository, 'README.md', 'base\n');
  const baseHash = commitAll(sandbox, repository, 'seed repository');
  git(sandbox, repository, ['branch', 'feature']);
  git(sandbox, repository, ['worktree', 'add', featureWorktree, 'feature']);

  writeRepositoryFile(featureWorktree, 'feature.txt', 'feature work\n');
  const featureHash = commitAll(sandbox, featureWorktree, 'feature work');
  assert.equal(git(sandbox, repository, ['rev-parse', 'main']), baseHash);

  git(sandbox, repository, ['merge', '--squash', 'feature']);
  const squashHash = commitAll(sandbox, repository, 'squash feature work');
  const ancestry = runGit(
    sandbox,
    repository,
    ['merge-base', '--is-ancestor', featureHash, squashHash],
    { allowFailure: true },
  );
  assert.notEqual(ancestry.status, 0);
  assert.equal(git(sandbox, repository, ['rev-list', '--parents', '-n', '1', squashHash]).split(/\s+/).length, 2);
  assert.equal(git(sandbox, repository, ['status', '--porcelain']), '');

  git(sandbox, repository, ['worktree', 'remove', featureWorktree]);

  assert.equal(existsSync(featureWorktree), false);
  assert.equal(git(sandbox, repository, ['rev-parse', 'refs/heads/feature']), featureHash);
  assert.equal(git(sandbox, repository, ['branch', '--show-current']), 'main');
  assert.equal(git(sandbox, repository, ['status', '--porcelain']), '');
});
