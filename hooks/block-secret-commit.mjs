import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from './hook-input.mjs';
import { gitCall, segments, tokens } from './shell-words.mjs';

// Stops a commit whose added lines hold a credential in an unmistakable vendor format. It catches casual
// mistakes, not a determined bypass: it is not a security boundary and does not replace a secret scanner.
// Only prefixed formats are listed; generic names such as "password" and entropy guesses are left out on purpose.
const PATTERNS = [
  ['private-key', /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----/],
  ['aws-access-key-id', /\b(?:AKIA|ASIA)(?![A-Z0-9]*EXAMPLE)[A-Z0-9]{16}\b/],
  ['github-token', /\bgh[pousr]_[A-Za-z0-9]{36,}/],
  ['github-fine-grained-token', /\bgithub_pat_[A-Za-z0-9_]{22,}/],
  ['gitlab-token', /\bglpat-[A-Za-z0-9_-]{20,}/],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{10,}/],
  ['stripe-live-key', /\b[sr]k_live_[A-Za-z0-9]{16,}/],
  ['anthropic-api-key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['google-api-key', /\bAIza[A-Za-z0-9_-]{35}\b/],
  ['npm-token', /\bnpm_[A-Za-z0-9]{36}\b/],
];
const COMMIT_VALUE_OPTIONS = new Set(['-m', '--message', '-F', '--file', '-c', '-C', '--reuse-message', '--reedit-message',
  '--author', '--date', '--trailer', '--fixup', '--squash', '-t', '--template', '--cleanup', '--pathspec-from-file']);
const COMMIT_SHORT_WITH_VALUE = new Set(['m', 'F', 'c', 'C', 't', 'u', 'S']);
const MAX_UNTRACKED_FILES = 200;
const MAX_FILE_BYTES = 512 * 1024;
const MAX_REPORTED = 10;

const patternsIn = (text) => PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);

// Added lines of a unified diff that hold a secret, as { file, line, pattern }. The value is never returned.
export function findSecrets(diffText) {
  const found = [];
  let file = null;
  let line = 0;
  for (const text of diffText.split('\n')) {
    if (text.startsWith('+++ ')) {
      const path = text.slice(4).replace(/^"|"$/g, '');
      file = path === '/dev/null' ? null : path.replace(/^b\//, '');
    } else if (text.startsWith('@@')) {
      line = Number(/\+(\d+)/.exec(text)?.[1] ?? 1) - 1;
    } else if (text.startsWith('+')) {
      line += 1;
      for (const pattern of patternsIn(text.slice(1))) found.push({ file, line, pattern });
    } else if (text.startsWith(' ')) {
      line += 1;
    }
  }
  return found;
}

function stagesEverything(rest) {
  for (let index = 0; index < rest.length; index += 1) {
    const word = rest[index];
    if (word === '--') return false;
    if (COMMIT_VALUE_OPTIONS.has(word)) { index += 1; continue; }
    if (word === '--all') return true;
    if (!/^-[A-Za-z]+$/.test(word)) continue;
    for (const letter of word.slice(1)) {
      if (letter === 'a') return true;
      if (COMMIT_SHORT_WITH_VALUE.has(letter)) break;
    }
  }
  return false;
}

// What a command would commit: null when it does not commit; `all` when tracked edits join the staged ones;
// `untracked` when a `git add` in the same command may bring in new files.
export function commitScope(command) {
  let added = false;
  let scope = null;
  for (const segment of segments(command)) {
    const call = gitCall(tokens(segment));
    if (call?.subcommand === 'add') added = true;
    if (call?.subcommand === 'commit' && !scope) scope = { all: stagesEverything(call.rest), directory: call.directory };
  }
  return scope ? { all: scope.all || added, untracked: added, directory: scope.directory } : null;
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 8000, maxBuffer: 32 * 1024 * 1024 });
}

function untrackedSecrets(cwd) {
  const found = [];
  const files = git(cwd, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean);
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

export function secretReason(input) {
  if (input.tool_name !== 'Bash') return null;
  const scope = commitScope(input.tool_input?.command ?? '');
  if (!scope) return null;
  let found;
  try {
    const cwd = resolve(input.cwd ?? process.cwd(), scope.directory ?? '.');
    const diff = (range) => git(cwd, ['diff', range, '-U0', '--no-color', '--no-ext-diff', '--src-prefix=a/', '--dst-prefix=b/']);
    let text;
    try {
      text = diff(scope.all ? 'HEAD' : '--cached');
    } catch {
      text = diff('--cached'); // a repository with no commit yet has no HEAD to compare against
    }
    found = findSecrets(text);
    if (scope.untracked) found.push(...untrackedSecrets(cwd));
  } catch {
    return null; // no git, no repository, or no commit yet: allow rather than guess
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
