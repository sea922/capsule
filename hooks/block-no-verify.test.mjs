import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { bypassReason } from './block-no-verify.mjs';

const blocked = [
  'git commit --no-verify -m "wip"',
  'git commit -n -m wip',
  'git commit -anm wip',
  'git push --no-verify origin main',
  'git push --no-verif',
  'git merge --no-verify feature',
  'git rebase --no-verify main',
  'cd repo && git commit --no-verify',
  'npm test; git commit --no-verify -m x',
  'git -C repo commit --no-verify',
  'git -c core.hooksPath=/dev/null commit -m x',
  'git -c Core.HooksPath= push',
  'git config core.hooksPath /tmp/none',
  'git config --local core.hooksPath .nohooks',
  'HUSKY=0 git commit -m x',
  'env HUSKY=0 git push',
];

const allowed = [
  'git commit -m "explain why --no-verify is banned"',
  "git commit -m 'skip -n flag talk'",
  'git commit -uno -m x',
  'git commit --trailer "Note: --no-verify" -m x',
  'git commit -F msg.txt',
  'git push origin main',
  'git status --no-verify-ish',
  'echo git commit --no-verify',
  'grep -r -- --no-verify docs',
  'git log --grep=--no-verify',
  'git config --get core.hooksPath',
  'npm run lint -- --no-verify',
  'git commit -m x -- --no-verify',
];

test('hook bypasses are blocked', () => {
  for (const command of blocked) assert.ok(bypassReason(command), command);
});

test('ordinary commands and quoted text are allowed', () => {
  for (const command of allowed) assert.equal(bypassReason(command), null, command);
});

test('the script blocks with exit 2 and a reason, allows with exit 0, and honours the off switch', () => {
  const script = fileURLToPath(new URL('./block-no-verify.mjs', import.meta.url));
  const run = (command, env = {}) => spawnSync(process.execPath, [script], {
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
    encoding: 'utf8', env: { ...process.env, CAPSULE_HOOKS_DISABLED: '', ...env },
  });
  const block = run('git commit --no-verify -m x');
  assert.equal(block.status, 2);
  assert.match(block.stderr, /hooks/i);
  assert.equal(run('git commit -m x').status, 0);
  assert.equal(run('git commit --no-verify', { CAPSULE_HOOKS_DISABLED: 'config-protection,block-no-verify' }).status, 0);
  const garbage = spawnSync(process.execPath, [script], { input: 'not json', encoding: 'utf8' });
  assert.equal(garbage.status, 0);
});
