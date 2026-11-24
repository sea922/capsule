#!/usr/bin/env node
// capsule's optional status line for Claude Code, in the "Aurora" look: coloured text, dot separators, and a
// ten-block context bar that fills along a teal-to-violet-to-pink gradient.
// It reads the JSON Claude Code passes on stdin and asks git for the branch. It makes no network request,
// reads nothing outside the working directory, and always prints something and exits 0.
import { execFileSync } from 'node:child_process';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const BAR_CELLS = 10;
// Mid-tone colours: each one keeps enough contrast on a black background and on a white one, so the line
// stays readable over any terminal theme or background image. A test holds every entry to that.
const COLORS = {
  model: '#19a9c9', separator: '#8089a6', directory: '#6d8cff', branch: '#a678f5', changed: '#cf9200', sync: '#19a9c9',
  track: '#727b99', calm: '#6d8cff', warm: '#e67e00', hot: '#f0486c', quiet: '#8089a6', cost: '#c99400',
  added: '#27ae60', removed: '#ee5c6c', time: '#8089a6',
};
const GRADIENT = ['#12b3a2', '#6f7cf7', '#ec4899'];
export const PALETTE = { ...COLORS, ...Object.fromEntries(GRADIENT.map((hex, index) => [`gradient${index + 1}`, hex])) };
const GLYPHS = {
  unicode: { model: '✦ ', separator: ' · ', branch: '', changed: '●', ahead: '↑', behind: '↓', full: '▮', empty: '▯', open: '', close: '', minus: '−', more: '…' },
  ascii: { model: '* ', separator: ' | ', branch: '', changed: '+', ahead: '^', behind: 'v', full: '#', empty: '.', open: '[', close: ']', minus: '-', more: '~' },
};

// Session text reaches the terminal, so control characters are removed before anything is printed.
const clean = (value) => (typeof value === 'string' ? value.replace(/[\x00-\x1f\x7f-\x9f]/g, '') : '');
const number = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
const width = (text) => [...text.replace(/\x1b\[[0-9;]*m/g, '')].length;
const rgb = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));

function gradientAt(position, stops) {
  const scaled = Math.max(0, Math.min(1, position)) * (stops.length - 1);
  const index = Math.min(Math.floor(scaled), stops.length - 2);
  const [from, to] = [rgb(stops[index]), rgb(stops[index + 1])];
  return from.map((channel, at) => Math.round(channel + (to[at] - channel) * (scaled - index)));
}

// The closest xterm 256-colour index: the 6x6x6 cube or the grey ramp, whichever is nearer.
const CUBE = [0, 95, 135, 175, 215, 255];
export function nearest256(color) {
  const [red, green, blue] = Array.isArray(color) ? color : rgb(color);
  const level = (value) => CUBE.reduce((best, step, index) => (Math.abs(step - value) < Math.abs(CUBE[best] - value) ? index : best), 0);
  const [r, g, b] = [level(red), level(green), level(blue)];
  const grey = Math.max(0, Math.min(23, Math.round(((red + green + blue) / 3 - 8) / 10)));
  const distance = (x, y, z) => (red - x) ** 2 + (green - y) ** 2 + (blue - z) ** 2;
  const shade = 8 + 10 * grey;
  return distance(shade, shade, shade) < distance(CUBE[r], CUBE[g], CUBE[b]) ? 232 + grey : 16 + 36 * r + 6 * g + b;
}

function painter(depth) {
  if (!depth) return (color, text) => text;
  const code = ([red, green, blue]) => (depth === 'truecolor'
    ? `\x1b[38;2;${red};${green};${blue}m`
    : `\x1b[38;5;${nearest256([red, green, blue])}m`);
  return (color, text, bold = false) => `${bold ? BOLD : ''}${code(Array.isArray(color) ? color : rgb(color))}${text}${RESET}`;
}

export function formatDuration(milliseconds) {
  const seconds = Math.floor((number(milliseconds) ?? 0) / 1000);
  if (seconds <= 0) return '';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)}h${String(rest).padStart(2, '0')}m` : `${Math.floor(minutes / 60)}h`;
}

// Reads `git status --porcelain=v2 --branch`.
export function parseGitStatus(output) {
  const lines = String(output ?? '').split('\n');
  const header = (name) => lines.find((line) => line.startsWith(`# ${name} `))?.slice(name.length + 3).trim();
  const head = header('branch.head');
  if (!head) return null;
  const [, ahead, behind] = /^\+(\d+) -(\d+)$/.exec(header('branch.ab') ?? '') ?? [];
  return {
    branch: head === '(detached)' ? (header('branch.oid') ?? '').slice(0, 7) : head,
    changed: lines.filter((line) => line && !line.startsWith('#')).length,
    ahead: Number(ahead ?? 0),
    behind: Number(behind ?? 0),
  };
}

const windowSize = (tokens) => (tokens >= 1_000_000 ? `${+(tokens / 1_000_000).toFixed(1)}M` : `${Math.round(tokens / 1000)}k`);
const heat = (percent, warmAt, hotAt) => (percent >= hotAt ? 'hot' : percent >= warmAt ? 'warm' : 'calm');
const shorten = (text, limit, more) => ([...text].length <= limit ? text : `${[...text].slice(0, Math.max(1, limit - 1)).join('')}${more}`);

// Returns the lines to print. `options`: color (false, '256', 'truecolor'), ascii, usage (always show rate
// limits), columns (terminal width to fit), git ({ branch, changed, ahead, behind }).
export function render(input, options = {}) {
  const data = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const glyphs = options.ascii ? GLYPHS.ascii : GLYPHS.unicode;
  const paint = painter(options.color);
  const columns = number(options.columns) > 0 ? options.columns : Infinity;

  const model = clean(data.model?.display_name) || 'Claude';
  const directory = basename(clean(data.workspace?.current_dir) || clean(data.cwd));
  const branch = clean(options.git?.branch) || clean(data.worktree?.branch);
  const used = number(data.context_window?.used_percentage);
  const percent = used === null ? null : Math.max(0, Math.min(100, Math.round(used)));
  const size = number(data.context_window?.context_window_size);
  const cost = data.cost ?? {};
  const added = number(cost.total_lines_added) ?? 0;
  const removed = number(cost.total_lines_removed) ?? 0;
  const duration = formatDuration(cost.total_duration_ms);
  const limits = [['5h', data.rate_limits?.five_hour], ['7d', data.rate_limits?.seven_day]]
    .map(([label, window]) => [label, number(window?.used_percentage)])
    .filter(([, value]) => value !== null)
    .map(([label, value]) => [label, Math.round(value)])
    .filter(([, value]) => options.usage || value >= 70); // quiet until a window is nearly used up
  const showLimits = limits.length > 0;

  // `detail` lists what is still shown; fitting a narrow terminal removes entries from it.
  const identity = (detail) => {
    const parts = [paint(COLORS.model, `${glyphs.model}${shorten(model, detail.modelWidth, glyphs.more)}`, true)];
    if (directory && detail.directory) parts.push(paint(COLORS.directory, shorten(directory, detail.nameWidth, glyphs.more)));
    if (branch && detail.branch) {
      let where = paint(COLORS.branch, `${glyphs.branch}${shorten(branch, detail.nameWidth, glyphs.more)}`);
      if (options.git?.changed > 0 && detail.changed) where += ` ${paint(COLORS.changed, `${glyphs.changed}${options.git.changed}`)}`;
      if (options.git?.ahead > 0 && detail.sync) where += ` ${paint(COLORS.sync, `${glyphs.ahead}${options.git.ahead}`)}`;
      if (options.git?.behind > 0 && detail.sync) where += ` ${paint(COLORS.sync, `${glyphs.behind}${options.git.behind}`)}`;
      parts.push(where);
    }
    return parts;
  };
  const metrics = (detail) => {
    const parts = [];
    if (percent !== null) {
      const cells = detail.barCells;
      const filled = Math.round((percent / 100) * cells);
      const stops = percent >= 80 ? [...GRADIENT, COLORS.hot] : GRADIENT; // a nearly full bar runs on into red
      let bar = '';
      for (let cell = 0; cell < cells; cell += 1) {
        if (cell < filled) bar += paint(gradientAt(cells > 1 ? cell / (cells - 1) : 0, stops), glyphs.full);
        else bar += paint(COLORS.track, options.color ? glyphs.full : glyphs.empty);
      }
      const level = heat(percent, 65, 80);
      let text = cells ? `${glyphs.open}${bar}${glyphs.close} ` : '';
      text += paint(COLORS[level], `${percent}%`, level === 'hot');
      if (size && detail.size) text += paint(COLORS.quiet, ` of ${windowSize(size)}`);
      parts.push(text);
    }
    if (number(cost.total_cost_usd) > 0 && detail.cost) parts.push(paint(COLORS.cost, `$${cost.total_cost_usd.toFixed(2)}`));
    if ((added > 0 || removed > 0) && detail.diff) parts.push(`${paint(COLORS.added, `+${added}`)} ${paint(COLORS.removed, `${glyphs.minus}${removed}`)}`);
    if (duration && detail.time) parts.push(paint(COLORS.time, duration));
    if (showLimits && detail.limits) {
      parts.push(limits.map(([label, value]) => `${paint(COLORS.time, label)} ${paint(COLORS[heat(value, 70, 90)], `${value}%`)}`).join(' '));
    }
    return parts;
  };
  const join = (parts) => parts.join(paint(COLORS.separator, glyphs.separator));
  const full = { modelWidth: 40, nameWidth: 60, directory: true, branch: true, changed: true, sync: true, barCells: BAR_CELLS, size: true, cost: true, diff: true, time: true, limits: true };

  const oneLine = join([...identity(full), ...metrics(full)]);
  if (width(oneLine) <= columns) return [oneLine];

  const fit = (build, steps) => {
    const detail = { ...full };
    let line = join(build(detail));
    for (const step of steps) {
      if (width(line) <= columns) break;
      Object.assign(detail, step);
      line = join(build(detail));
    }
    return line;
  };
  const top = fit(identity, [{ nameWidth: 24 }, { sync: false }, { changed: false }, { nameWidth: 14 }, { directory: false }, { nameWidth: 8 }, { branch: false }, { modelWidth: Math.max(1, columns - 2) }]);
  const bottom = fit(metrics, [{ time: false }, { diff: false }, { size: false }, { barCells: 5 }, { cost: false }, { limits: false }, { barCells: 0 }]);
  return [top, bottom].filter(Boolean);
}

function gitState(directory) {
  if (!directory) return null;
  try {
    const output = execFileSync('git', ['-C', directory, '--no-optional-locks', 'status', '--porcelain=v2', '--branch'], {
      encoding: 'utf8',
      timeout: 1000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return parseGitStatus(output);
  } catch {
    return null; // not a repository, git missing, or too slow: show the line without a branch
  }
}

function colorDepth(env) {
  if (env.NO_COLOR) return false;
  const choice = env.CAPSULE_STATUSLINE_COLOR;
  if (choice === 'none') return false;
  if (choice === '256' || choice === 'truecolor') return choice;
  return /truecolor|24bit/i.test(env.COLORTERM ?? '') ? 'truecolor' : '256';
}

function settings(env) {
  return { color: colorDepth(env), ascii: env.CAPSULE_STATUSLINE_ASCII === '1', usage: env.CAPSULE_STATUSLINE_USAGE === '1', columns: Number(env.COLUMNS) || undefined };
}

function demo() {
  const base = { model: { display_name: 'Fable 5.2' }, workspace: { current_dir: '/work/capsule' } };
  const states = [
    ['normal', { ...base, context_window: { used_percentage: 43, context_window_size: 1_000_000 }, cost: { total_cost_usd: 12.5, total_duration_ms: 4_980_000, total_lines_added: 920, total_lines_removed: 247 } }, { branch: 'feat/ecc-adoption', changed: 3, ahead: 2, behind: 0 }, {}],
    ['filling up', { ...base, context_window: { used_percentage: 71, context_window_size: 1_000_000 }, cost: { total_cost_usd: 27.3, total_duration_ms: 9_300_000, total_lines_added: 1510, total_lines_removed: 302 } }, { branch: 'feat/ecc-adoption', changed: 0, ahead: 0, behind: 1 }, {}],
    ['nearly full, 5-hour limit running out', { ...base, context_window: { used_percentage: 88, context_window_size: 1_000_000 }, cost: { total_cost_usd: 41.07, total_duration_ms: 14_520_000, total_lines_added: 2104, total_lines_removed: 388 }, rate_limits: { five_hour: { used_percentage: 82 }, seven_day: { used_percentage: 58 } } }, { branch: 'main', changed: 0, ahead: 0, behind: 0 }, {}],
    ['narrow terminal (48 columns)', { ...base, context_window: { used_percentage: 43, context_window_size: 1_000_000 }, cost: { total_cost_usd: 12.5, total_duration_ms: 4_980_000, total_lines_added: 920, total_lines_removed: 247 } }, { branch: 'feat/ecc-adoption', changed: 3, ahead: 2, behind: 0 }, { columns: 48 }],
  ];
  const base_options = { ...settings(process.env), columns: undefined };
  for (const [label, data, git, extra] of states) {
    process.stdout.write(`${label}\n${render(data, { ...base_options, git, ...extra }).join('\n')}\n\n`);
  }
}

function main() {
  if (process.argv.includes('--demo')) return demo();
  let text = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { if (text.length < 1_000_000) text += chunk; });
  process.stdin.on('end', () => {
    let data = {};
    try { data = JSON.parse(text); } catch { /* print the fallback line */ }
    const directory = typeof data?.workspace?.current_dir === 'string' ? data.workspace.current_dir : null;
    process.stdout.write(render(data, { ...settings(process.env), git: gitState(directory) }).join('\n'));
  });
  return undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
