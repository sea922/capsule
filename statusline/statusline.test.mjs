import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { formatDuration, parseGitStatus, render } from './statusline.mjs';
import { installStatusline } from './install.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const plain = { color: false };
const sample = {
  model: { display_name: 'Opus' },
  workspace: { current_dir: '/work/capsule' },
  cost: { total_cost_usd: 1.234, total_duration_ms: 905000, total_lines_added: 120, total_lines_removed: 34 },
  context_window: { used_percentage: 68, context_window_size: 200000 },
};

test('one line shows model, directory, branch, context, and session numbers', () => {
  const [line, ...rest] = render(sample, { ...plain, git: { branch: 'feat/x', dirty: true } });
  assert.equal(rest.length, 0);
  assert.equal(line, 'Opus │ capsule ⎇ feat/x* │ ██████░░░░ 68% │ $1.23 +120/-34 15m');
});

test('missing fields are left out instead of printed as blanks or zeros', () => {
  assert.deepEqual(render({}, plain), ['Claude']);
  assert.deepEqual(render({ model: { display_name: 'Opus' }, workspace: { current_dir: '/a/b' }, context_window: { used_percentage: null } }, plain), ['Opus │ b']);
  assert.deepEqual(render({ ...sample, cost: { total_cost_usd: 0, total_duration_ms: 0 } }, plain), ['Opus │ capsule │ ██████░░░░ 68%']);
});

test('a clean branch has no marker, and a worktree branch is used when git gave none', () => {
  assert.match(render(sample, { ...plain, git: { branch: 'main', dirty: false } })[0], /capsule ⎇ main │/);
  assert.match(render({ ...sample, worktree: { branch: 'wt-1' } }, plain)[0], /capsule ⎇ wt-1 │/);
});

test('the context bar is clamped and coloured by how full the window is', () => {
  const bar = (used) => render({ context_window: { used_percentage: used } }, { color: true })[0];
  assert.match(bar(10), /\x1b\[32m█░{9} 10%/);
  assert.match(bar(55), /\x1b\[33m/);
  assert.match(bar(70), /\x1b\[38;5;208m/);
  assert.match(bar(95), /\x1b\[1;31m/);
  assert.match(render({ context_window: { used_percentage: 140 } }, plain)[0], /█{10} 100%/);
  assert.match(render({ context_window: { used_percentage: -5 } }, plain)[0], /░{10} 0%/);
});

test('ASCII mode avoids box and block characters', () => {
  const [line] = render(sample, { ...plain, ascii: true, git: { branch: 'main', dirty: true } });
  assert.equal(line, 'Opus | capsule @ main* | [######....] 68% | $1.23 +120/-34 15m');
});

test('the usage line appears only when asked for and only for windows that exist', () => {
  const limits = { rate_limits: { five_hour: { used_percentage: 23.5 }, seven_day: { used_percentage: 41.2 } } };
  assert.equal(render({ ...sample, ...limits }, plain).length, 1);
  const lines = render({ ...sample, ...limits }, { ...plain, usage: true });
  assert.equal(lines[1], '5h 24% │ 7d 41%');
  assert.equal(render(sample, { ...plain, usage: true }).length, 1);
  assert.equal(render({ ...sample, rate_limits: { seven_day: { used_percentage: 9 } } }, { ...plain, usage: true })[1], '7d 9%');
});

test('text from the session cannot inject terminal control sequences', () => {
  const [line] = render({ model: { display_name: 'Op\x1b[31mus\x07' }, workspace: { current_dir: '/x/pro\x1b]0;evil\x07ject\n2' } }, { ...plain, git: { branch: 'a\x1b[0mb', dirty: false } });
  assert.ok(!/[\x00-\x1f\x7f]/.test(line), JSON.stringify(line));
});

test('durations are short and readable', () => {
  assert.equal(formatDuration(0), '');
  assert.equal(formatDuration(42000), '42s');
  assert.equal(formatDuration(905000), '15m');
  assert.equal(formatDuration(3600000), '1h');
  assert.equal(formatDuration(5025000), '1h23m');
});

test('git status output is reduced to a branch and a dirty flag', () => {
  assert.deepEqual(parseGitStatus('# branch.oid abc\n# branch.head feat/x\n1 .M N... 100644 100644 100644 a b file.txt\n'), { branch: 'feat/x', dirty: true });
  assert.deepEqual(parseGitStatus('# branch.oid abc\n# branch.head main\n'), { branch: 'main', dirty: false });
  assert.deepEqual(parseGitStatus('# branch.oid abcdef1234\n# branch.head (detached)\n'), { branch: 'abcdef1', dirty: false });
  assert.equal(parseGitStatus(''), null);
});

const run = (stdin, env = {}) => spawnSync(process.execPath, [join(HERE, 'statusline.mjs')], { input: stdin, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', ...env } });

test('the script prints a line and exits 0 for real input, bad input, and no input', () => {
  const outside = mkdtempSync(join(tmpdir(), 'capsule-statusline-'));
  try {
    const good = run(JSON.stringify({ ...sample, workspace: { current_dir: outside } }));
    assert.equal(good.status, 0, good.stderr);
    assert.match(good.stdout, /^Opus │ capsule-statusline-\S+ │ ██████░░░░ 68% │ \$1\.23 \+120\/-34 15m$/);
    for (const input of ['', 'not json', 'null', '[]', '42']) {
      const result = run(input);
      assert.equal(result.status, 0, `${JSON.stringify(input)}: ${result.stderr}`);
      assert.equal(result.stdout, 'Claude');
    }
  } finally {
    rmSync(outside, { recursive: true, force: true });
  }
});

function project(t) {
  const root = mkdtempSync(join(tmpdir(), 'capsule-statusline-install-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
const settingsOf = (root) => JSON.parse(readFileSync(join(root, '.claude', 'settings.local.json'), 'utf8'));

test('a dry run reports the plan and writes nothing', (t) => {
  const root = project(t);
  const result = installStatusline({ target: root });
  assert.equal(result.dryRun, true);
  assert.equal(existsSync(join(root, '.claude')), false);
});

test('apply copies the script and points the local settings at it', (t) => {
  const root = project(t);
  const result = installStatusline({ target: root, apply: true });
  const script = join(root, '.claude', 'capsule-statusline.mjs');
  assert.equal(result.script, script);
  assert.equal(readFileSync(script, 'utf8'), readFileSync(join(HERE, 'statusline.mjs'), 'utf8'));
  assert.deepEqual(settingsOf(root).statusLine, { type: 'command', command: `node "${script}"` });
  const again = installStatusline({ target: root, apply: true });
  assert.equal(again.changed, false);
});

test('existing settings are kept, and an existing status line is never replaced', (t) => {
  const root = project(t);
  mkdirSync(join(root, '.claude'));
  writeFileSync(join(root, '.claude', 'settings.local.json'), JSON.stringify({ permissions: { allow: ['Read'] } }));
  installStatusline({ target: root, apply: true });
  assert.deepEqual(settingsOf(root).permissions, { allow: ['Read'] });

  const other = project(t);
  mkdirSync(join(other, '.claude'));
  const mine = { statusLine: { type: 'command', command: 'my-own-line' } };
  writeFileSync(join(other, '.claude', 'settings.local.json'), JSON.stringify(mine));
  assert.throws(() => installStatusline({ target: other, apply: true }), /already has a status line/);
  assert.deepEqual(settingsOf(other), mine);
  assert.equal(existsSync(join(other, '.claude', 'capsule-statusline.mjs')), false);
});

test('unreadable settings and a missing target stop the install before anything is written', (t) => {
  const root = project(t);
  mkdirSync(join(root, '.claude'));
  writeFileSync(join(root, '.claude', 'settings.local.json'), '{ not json');
  assert.throws(() => installStatusline({ target: root, apply: true }), /not valid JSON/);
  assert.equal(existsSync(join(root, '.claude', 'capsule-statusline.mjs')), false);
  assert.throws(() => installStatusline({ target: join(root, 'missing'), apply: true }), /not an existing directory/);
});
