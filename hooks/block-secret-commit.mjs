import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from './hook-input.mjs';
import { gitCall, program, segments, tokens } from './shell-words.mjs';

// Stops a commit whose added lines hold a credential in an unmistakable vendor format. It catches casual
// mistakes, not a determined bypass: it is not a security boundary and does not replace a secret scanner.
// Only prefixed formats are listed; generic names such as "password" and entropy guesses are left out on
// purpose, and so are keys that are routinely committed in client configuration.
const PATTERNS = [
  ['private-key', /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/],
  ['aws-access-key-id', /\b(?:AKIA|ASIA)(?![A-Z0-9]*EXAMPLE)[A-Z0-9]{16}\b/],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{36,}/],
  ['github-fine-grained-token', /\bgithub_pat_[A-Za-z0-9_]{22,}/],
  ['gitlab-token', /\bglpat-[A-Za-z0-9_-]{20,}/],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['stripe-live-key', /\b[sr]k_live_[A-Za-z0-9]{16,}/],
  ['anthropic-api-key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['npm-token', /\bnpm_[A-Za-z0-9]{36}\b/],
];
const COMMIT_VALUE_OPTIONS = new Set(['-m', '--message', '-F', '--file', '-c', '-C', '--reuse-message', '--reedit-message',
  '--author', '--date', '--trailer', '--fixup', '--squash', '-t', '--template', '--cleanup', '--pathspec-from-file']);
// Short options that take a value. `-u` and `-S` only take one attached, so they never consume the next word.
const COMMIT_SHORT_WITH_VALUE = new Set(['m', 'F', 'c', 'C', 't', 'u', 'S']);
const COMMIT_SHORT_ATTACHED_ONLY = new Set(['u', 'S']);
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh']);
const MAX_UNTRACKED_FILES = 200;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_REPORTED = 10;
// One budget for every git call, so the hook finishes inside its timeout in hooks.json and then allows.
const TIME_BUDGET_MS = 10_000;

const patternsIn = (text) => PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);

// Added lines of a unified diff that hold a secret, as { file, line, pattern }. The value is never returned.
export function findSecrets(diffText) {
  const found = [];
  let file = null;
  let line = 0;
  let inHeader = true;
  let previous = '';
  for (const text of diffText.split('\n')) {
    if (text.startsWith('diff --git ')) {
      inHeader = true;
    } else if (inHeader && text.startsWith('+++ ') && previous.startsWith('--- ')) {
      // Only a header line names a file: an added line that happens to start with "++ " is content.
      const path = text.slice(4).replace(/\t.*$/, '').replace(/^"(.*)"$/, '$1');
      file = path === '/dev/null' ? null : path.replace(/^b\//, '');
    } else if (text.startsWith('@@')) {
      inHeader = false;
      line = Number(/\+(\d+)/.exec(text)?.[1] ?? 1) - 1;
    } else if (!inHeader && text.startsWith('+')) {
      line += 1;
      for (const pattern of patternsIn(text.slice(1))) found.push({ file, line, pattern });
    } else if (!inHeader && text.startsWith(' ')) {
      line += 1;
    }
    previous = text;
  }
  return found;
}

// `git commit` arguments: whether tracked edits join the staged ones (-a), and any pathspecs.
function commitArguments(rest) {
  const paths = [];
  let all = false;
  for (let index = 0; index < rest.length; index += 1) {
    const word = rest[index];
    if (word === '--') { paths.push(...rest.slice(index + 1)); break; }
    if (COMMIT_VALUE_OPTIONS.has(word)) { index += 1; continue; }
    if (word === '--all') all = true;
    else if (!word.startsWith('-')) paths.push(word);
    else if (!word.startsWith('--')) {
      const letters = word.slice(1);
      for (let position = 0; position < letters.length; position += 1) {
        if (letters[position] === 'a') all = true;
        if (!COMMIT_SHORT_WITH_VALUE.has(letters[position])) continue;
        if (position === letters.length - 1 && !COMMIT_SHORT_ATTACHED_ONLY.has(letters[position])) index += 1;
        break;
      }
    }
  }
  return { all, paths };
}

// `git add` arguments: the pathspecs it names (the whole tree for a bare -A) and whether -f reaches ignored files.
function addArguments(rest) {
  const paths = [];
  let everything = false;
  let force = false;
  for (let index = 0; index < rest.length; index += 1) {
    const word = rest[index];
    if (word === '--') { paths.push(...rest.slice(index + 1)); break; }
    if (word === '--pathspec-from-file') index += 1;
    else if (word === '--all' || word === '--no-ignore-removal') everything = true;
    else if (word === '--force') force = true;
    else if (/^-[A-Za-z]+$/.test(word)) {
      if (word.includes('A')) everything = true;
      if (word.includes('f')) force = true;
    } else if (!word.startsWith('-')) paths.push(word);
  }
  return { paths: paths.length > 0 || !everything ? paths : [':/'], force };
}

// What a command would commit: null when it does not commit. `all` means the working tree is compared with HEAD
// (commit -a, a pathspec commit, or a `git add` earlier in the same command, which has not run yet when the hook
// fires); `add` holds the pathspecs that `git add` names, so new files among them are read too.
export function commitScope(command) {
  let add = null;
  let scope = null;
  const visit = (text) => {
    for (const segment of segments(text)) {
      const words = tokens(segment);
      const [tool, ...args] = program(words);
      if (SHELLS.has(tool)) {
        const flag = args.findIndex((word) => /^-[A-Za-z]*c$/.test(word));
        if (flag !== -1) visit(args[flag + 1] ?? '');
        continue;
      }
      const call = gitCall(words);
      if (call?.subcommand === 'add') {
        const named = addArguments(call.rest);
        add = { paths: [...(add?.paths ?? []), ...named.paths], force: (add?.force ?? false) || named.force };
      } else if (call?.subcommand === 'commit' && !scope) {
        const { all, paths } = commitArguments(call.rest);
        scope = { all: all || paths.length > 0, directory: call.directory };
      }
    }
  };
  visit(command);
  return scope ? { all: scope.all || add !== null, add, directory: scope.directory } : null;
}

function untrackedSecrets(cwd, add, git) {
  if (add.paths.length === 0) return [];
  const found = [];
  const listing = ['ls-files', '--others', '-z', ...(add.force ? [] : ['--exclude-standard']), '--', ...add.paths];
  const files = git(listing).split('\0').filter(Boolean);
  for (const file of files.slice(0, MAX_UNTRACKED_FILES)) {
    try {
      const path = join(cwd, file);
      const stats = lstatSync(path);
      if (!stats.isFile() || stats.size > MAX_FILE_BYTES) continue;
      readFileSync(path, 'utf8').split('\n').forEach((text, index) => {
        for (const pattern of patternsIn(text)) found.push({ file, line: index + 1, pattern });
      });
    } catch { /* unreadable file: skip it */ }
  }
  return found;
}

export function secretReason(input, budget = TIME_BUDGET_MS) {
  if (input.tool_name !== 'Bash') return null;
  const scope = commitScope(input.tool_input?.command);
  if (!scope) return null;
  let found;
  try {
    const cwd = resolve(typeof input.cwd === 'string' ? input.cwd : process.cwd(), scope.directory ?? '.');
    const deadline = Date.now() + budget;
    const git = (args) => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) throw new Error('out of time');
      return execFileSync('git', ['-c', 'core.quotePath=false', ...args], {
        cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: remaining, maxBuffer: 32 * 1024 * 1024,
      });
    };
    const diff = (range) => git(['diff', range, '-U0', '--no-color', '--no-ext-diff', '--src-prefix=a/', '--dst-prefix=b/']);
    let text;
    try {
      text = diff(scope.all ? 'HEAD' : '--cached');
    } catch {
      text = diff('--cached'); // a repository with no commit yet has no HEAD to compare against
    }
    found = findSecrets(text);
    if (scope.add) found.push(...untrackedSecrets(cwd, scope.add, git));
  } catch {
    return null; // no git, no repository, an unreadable diff, or out of time: allow rather than guess
  }
  if (found.length === 0) return null;
  const places = found.slice(0, MAX_REPORTED).map(({ file, line, pattern }) => `  ${file}:${line} ${pattern}`);
  if (found.length > MAX_REPORTED) places.push(`  and ${found.length - MAX_REPORTED} more`);
  return `Blocked: this commit would add what looks like a credential:\n${places.join('\n')}\n`
    + 'Remove it from the change and load it from the environment or a secrets manager. If it was ever real, tell the '
    + 'user to rotate it. If it is a deliberate test fixture, ask the user before committing.';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runHook('block-secret-commit', secretReason);
}
