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
const git = { branch: 'feat/x', changed: 2, ahead: 1, behind: 0 };
const strip = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');
const BAR68 = `${'━'.repeat(15)}${'─'.repeat(7)}`;
const FULL = `✦ Opus · capsule · ⎇ feat/x ●2 ↑1 · ${BAR68} 68% of 200k · $1.23 · +120 −34 · 15m`;

test('one line shows model, directory, git state, context, and session numbers', () => {
  assert.deepEqual(render(sample, { ...plain, git }), [FULL]);
});

test('with colour the text is the same, the bar is one glyph, and the fill is a gradient', () => {
  const [line] = render(sample, { color: 'truecolor', git });
  assert.equal(strip(line), FULL.replace(BAR68, '━'.repeat(22)));
  const cells = [...line.matchAll(/\x1b\[38;2;(\d+);(\d+);(\d+)m━/g)].map((match) => match.slice(1).join(','));
  assert.equal(cells.length, 22);
  assert.equal(cells[0], '45,212,191');
  assert.ok(new Set(cells.slice(0, 15)).size >= 12, 'the filled cells should change colour along the bar');
  assert.equal(new Set(cells.slice(15)).size, 1, 'the empty cells share one dim colour');
});

test('a terminal without 24-bit colour gets the nearest 256-colour codes', () => {
  const [line] = render(sample, { color: '256', git });
  assert.equal(strip(line), FULL.replace(BAR68, '━'.repeat(22)));
  assert.match(line, /\x1b\[38;5;\d+m/);
  assert.ok(!line.includes('38;2;'));
});

test('missing fields are left out instead of printed as blanks or zeros', () => {
  assert.deepEqual(render({}, plain), ['✦ Claude']);
  assert.deepEqual(render({ model: { display_name: 'Opus' }, workspace: { current_dir: '/a/b' }, context_window: { used_percentage: null } }, plain), ['✦ Opus · b']);
  assert.deepEqual(render({ ...sample, cost: { total_cost_usd: 0, total_duration_ms: 0 } }, plain), [`✦ Opus · capsule · ${BAR68} 68% of 200k`]);
});

test('git shows only what is true: clean, changed, ahead, behind, or a worktree branch', () => {
  const where = (state, data = sample) => render(data, { ...plain, git: state })[0].split(' · ')[2];
  assert.equal(where({ branch: 'main', changed: 0, ahead: 0, behind: 0 }), '⎇ main');
  assert.equal(where({ branch: 'main', changed: 12, ahead: 0, behind: 3 }), '⎇ main ●12 ↓3');
  assert.equal(render({ ...sample, worktree: { branch: 'wt-1' } }, plain)[0].split(' · ')[2], '⎇ wt-1');
});

test('the context bar is clamped, sized from the window, and turns warm as it fills', () => {
  const bar = (used, size) => render({ context_window: { used_percentage: used, context_window_size: size } }, plain)[0].split(' · ')[1];
  assert.equal(bar(0), `${'─'.repeat(22)} 0%`);
  assert.equal(bar(3), `━${'─'.repeat(21)} 3%`);
  assert.equal(bar(43, 1000000), `${'━'.repeat(9)}${'─'.repeat(13)} 43% of 1M`);
  assert.equal(bar(140), `${'━'.repeat(22)} 100%`);
  assert.equal(bar(-5), `${'─'.repeat(22)} 0%`);
  const percent = (used) => render({ context_window: { used_percentage: used } }, { color: 'truecolor' })[0].match(/(\x1b\[[0-9;]*m)+\d+%/)[0];
  assert.match(percent(40), /38;2;165;180;252m40%/);
  assert.match(percent(70), /38;2;253;186;116m70%/);
  assert.match(percent(90), /\x1b\[1m\x1b\[38;2;251;113;133m90%/);
});

test('rate limits stay hidden until a window is nearly used up, unless asked for', () => {
  const limits = (five, seven) => ({ ...sample, rate_limits: { five_hour: { used_percentage: five }, seven_day: { used_percentage: seven } } });
  assert.ok(!render(limits(23.5, 41.2), plain)[0].includes('5h'));
  assert.match(render(limits(82, 41.2), plain)[0], / · 5h 82%$/);
  assert.match(render(limits(23.5, 41.2), { ...plain, usage: true })[0], / · 5h 24% 7d 41%$/);
  assert.ok(!render(sample, { ...plain, usage: true })[0].includes('5h'));
});

test('a narrow terminal wraps to two lines, then drops the least important details', () => {
  assert.deepEqual(render(sample, { ...plain, git, columns: [...FULL].length }), [FULL]);
  assert.deepEqual(render(sample, { ...plain, git, columns: 70 }), ['✦ Opus · capsule · ⎇ feat/x ●2 ↑1', `${BAR68} 68% of 200k · $1.23 · +120 −34 · 15m`]);
  for (const columns of [50, 36, 24, 12]) {
    const lines = render(sample, { ...plain, git, columns });
    assert.equal(lines.length, 2, `${columns}: ${JSON.stringify(lines)}`);
    for (const line of lines) assert.ok([...line].length <= columns, `${columns}: ${line}`);
    assert.match(lines[0], /^✦ O/);
    assert.match(lines[1], /68%/);
  }
  const long = render({ ...sample, workspace: { current_dir: '/x/a-very-long-project-directory-name' } }, { ...plain, git: { branch: 'feature/a-very-long-branch-name-for-testing', changed: 0, ahead: 0, behind: 0 }, columns: 40 });
  assert.ok([...long[0]].length <= 40 && long[0].includes('…'), long[0]);
});

test('ASCII mode avoids every non-ASCII character', () => {
  const [line] = render(sample, { ...plain, ascii: true, git: { ...git, behind: 4 } });
  assert.equal(line, `* Opus | capsule | @ feat/x +2 ^1 v4 | [${'#'.repeat(15)}${'.'.repeat(7)}] 68% of 200k | $1.23 | +120 -34 | 15m`);
  assert.ok(/^[\x20-\x7e]+$/.test(strip(render(sample, { color: 'truecolor', ascii: true, git })[0])));
});

test('text from the session cannot inject terminal control sequences', () => {
  const [line] = render({ model: { display_name: 'Op\x1b[31mus\x07' }, workspace: { current_dir: '/x/pro\x1b]0;evil\x07ject\n2' } }, { ...plain, git: { branch: 'a\x1b[0mb', changed: 0, ahead: 0, behind: 0 } });
  assert.ok(!/[\x00-\x1f\x7f]/.test(line), JSON.stringify(line));
});

test('durations are short and readable', () => {
  assert.equal(formatDuration(0), '');
  assert.equal(formatDuration(42000), '42s');
  assert.equal(formatDuration(905000), '15m');
  assert.equal(formatDuration(3600000), '1h');
  assert.equal(formatDuration(5025000), '1h23m');
});

test('git status output is reduced to a branch, a change count, and ahead and behind', () => {
  assert.deepEqual(parseGitStatus('# branch.oid abc\n# branch.head feat/x\n# branch.ab +2 -1\n1 .M N... 100644 100644 100644 a b file.txt\n? new.txt\n'), { branch: 'feat/x', changed: 2, ahead: 2, behind: 1 });
  assert.deepEqual(parseGitStatus('# branch.oid abc\n# branch.head main\n'), { branch: 'main', changed: 0, ahead: 0, behind: 0 });
  assert.deepEqual(parseGitStatus('# branch.oid abcdef1234\n# branch.head (detached)\n'), { branch: 'abcdef1', changed: 0, ahead: 0, behind: 0 });
  assert.equal(parseGitStatus(''), null);
});

const run = (stdin, env = {}) => spawnSync(process.execPath, [join(HERE, 'statusline.mjs')], { input: stdin, encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', ...env } });

test('the script prints a line and exits 0 for real input, bad input, and no input', () => {
  const outside = mkdtempSync(join(tmpdir(), 'capsule-statusline-'));
  try {
    const good = run(JSON.stringify({ ...sample, workspace: { current_dir: outside } }));
    assert.equal(good.status, 0, good.stderr);
    assert.match(good.stdout, /^✦ Opus · capsule-statusline-\S+ · ━{15}─{7} 68% of 200k · \$1\.23 · \+120 −34 · 15m$/);
    for (const input of ['', 'not json', 'null', '[]', '42']) {
      const result = run(input);
      assert.equal(result.status, 0, `${JSON.stringify(input)}: ${result.stderr}`);
      assert.equal(result.stdout, '✦ Claude');
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

test('the demo prints sample lines without needing a session', () => {
  const result = spawnSync(process.execPath, [join(HERE, 'statusline.mjs'), '--demo'], { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /✦ .* 43% of 1M/);
  assert.match(result.stdout, /88%/);
  assert.match(result.stdout, /5h 82%/);
});
