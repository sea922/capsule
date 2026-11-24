#!/usr/bin/env node
// capsule's optional status line for Claude Code: model, directory and branch, context used, and session numbers.
// It reads the JSON Claude Code passes on stdin and asks git for the branch. It makes no network request,
// reads nothing outside the working directory, and always prints something and exits 0.
import { execFileSync } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const SKY = '\x1b[38;5;117m';
const GLYPHS = {
  unicode: { separator: ' │ ', branch: '⎇', full: '█', empty: '░', open: '', close: '' },
  ascii: { separator: ' | ', branch: '@', full: '#', empty: '.', open: '[', close: ']' },
};

// Session text reaches the terminal, so control characters are removed before anything is printed.
const clean = (value) => (typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f-\x9f]/g, '') : '');
const number = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);

export function formatDuration(milliseconds) {
  const seconds = Math.floor((number(milliseconds) ?? 0) / 1000);
  if (seconds <= 0) return '';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)}h${rest}m` : `${Math.floor(minutes / 60)}h`;
}

// Reads `git status --porcelain=v2 --branch`.
export function parseGitStatus(output) {
  const lines = String(output ?? '').split('\n');
  const head = lines.find((line) => line.startsWith('# branch.head '))?.slice('# branch.head '.length).trim();
  if (!head) return null;
  const commit = lines.find((line) => line.startsWith('# branch.oid '))?.slice('# branch.oid '.length).trim() ?? '';
  return {
    branch: head === '(detached)' ? commit.slice(0, 7) : head,
    dirty: lines.some((line) => line && !line.startsWith('#')),
  };
}

function contextColor(used) {
  if (used < 50) return '\x1b[32m';
  if (used < 65) return '\x1b[33m';
  if (used < 80) return '\x1b[38;5;208m';
  return '\x1b[1;31m';
}

// Returns the lines to print. `options`: color, ascii, usage (add a rate-limit line), git ({ branch, dirty }).
export function render(input, options = {}) {
  const data = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const glyphs = options.ascii ? GLYPHS.ascii : GLYPHS.unicode;
  const paint = (code, text) => (options.color ? `${code}${text}${RESET}` : text);
  const parts = [paint(DIM, clean(data.model?.display_name) || 'Claude')];

  const directory = clean(data.workspace?.current_dir) || clean(data.cwd);
  const branch = clean(options.git?.branch) || clean(data.worktree?.branch);
  if (directory) {
    const where = branch ? `${basename(directory)} ${glyphs.branch} ${branch}${options.git?.dirty ? '*' : ''}` : basename(directory);
    parts.push(paint(DIM, where));
  }

  const used = number(data.context_window?.used_percentage);
  if (used !== null) {
    const percent = Math.max(0, Math.min(100, Math.round(used)));
    const filled = Math.floor(percent / 10);
    const bar = `${glyphs.open}${glyphs.full.repeat(filled)}${glyphs.empty.repeat(10 - filled)}${glyphs.close}`;
    parts.push(paint(contextColor(percent), `${bar} ${percent}%`));
  }

  const cost = data.cost ?? {};
  const numbers = [];
  if (number(cost.total_cost_usd) > 0) numbers.push(`$${cost.total_cost_usd.toFixed(2)}`);
  const added = number(cost.total_lines_added) ?? 0;
  const removed = number(cost.total_lines_removed) ?? 0;
  if (added > 0 || removed > 0) numbers.push(`+${added}/-${removed}`);
  const duration = formatDuration(cost.total_duration_ms);
  if (duration) numbers.push(duration);
  if (numbers.length) parts.push(paint(SKY, numbers.join(' ')));

  const lines = [parts.join(paint(DIM, glyphs.separator))];
  if (options.usage) {
    const windows = [['5h', data.rate_limits?.five_hour], ['7d', data.rate_limits?.seven_day]]
      .filter(([, window]) => number(window?.used_percentage) !== null)
      .map(([label, window]) => {
        const percent = Math.round(window.used_percentage);
        return `${paint(DIM, label)} ${paint(contextColor(percent), `${percent}%`)}`;
      });
    if (windows.length) lines.push(windows.join(paint(DIM, glyphs.separator)));
  }
  return lines;
}

function gitState(directory) {
  if (!directory) return null;
  try {
    const output = execFileSync('git', ['-C', directory, '--no-optional-locks', 'status', '--porcelain=v2', '--branch', '--untracked-files=no'], {
      encoding: 'utf8',
      timeout: 1000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return parseGitStatus(output);
  } catch {
    return null; // not a repository, git missing, or too slow: show the line without a branch
  }
}

function main() {
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { if (text.length < 1_000_000) text += chunk; });
  process.stdin.on('end', () => {
    let data = {};
    try { data = JSON.parse(text); } catch { /* print the fallback line */ }
    const env = process.env;
    const directory = typeof data?.workspace?.current_dir === 'string' ? data.workspace.current_dir : null;
    const lines = render(data, {
      color: !env.NO_COLOR,
      ascii: env.CAPSULE_STATUSLINE_ASCII === '1',
      usage: env.CAPSULE_STATUSLINE_USAGE === '1',
      git: gitState(directory),
    });
    process.stdout.write(lines.join('\n'));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
