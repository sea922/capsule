import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from './hook-input.mjs';

const HOOKED_COMMANDS = new Set(['commit', 'push', 'merge', 'rebase', 'am']);
const GIT_VALUE_OPTIONS = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path']);
// Options whose next argument is a value, so a `--no-verify` there is text, not a flag.
const VALUE_OPTIONS = {
  commit: new Set(['-m', '--message', '-F', '--file', '-c', '-C', '--reuse-message', '--reedit-message', '--author',
    '--date', '--trailer', '--fixup', '--squash', '-t', '--template', '--cleanup', '--pathspec-from-file']),
  push: new Set(['-o', '--push-option', '--receive-pack', '--exec', '--repo']),
  merge: new Set(['-m', '-F', '--file', '-s', '--strategy', '-X', '--strategy-option']),
  rebase: new Set(['-s', '--strategy', '-X', '--strategy-option', '--onto', '-x', '--exec']),
  am: new Set(['-S', '--directory', '--exclude', '--include', '-p']),
};
// commit's short options that take a value end a cluster such as `-am`.
const COMMIT_SHORT_WITH_VALUE = new Set(['m', 'F', 'c', 'C', 't', 'u', 'S']);

function segments(command) {
  const parts = [];
  let current = '';
  let quote = null;
  for (let index = 0; index < command.length; index += 1) {
    const character = command[index];
    if (quote) {
      if (character === quote) quote = null;
      else if (character === '\\' && quote === '"') { current += character + (command[index + 1] ?? ''); index += 1; continue; }
      current += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (';|&\n'.includes(character)) {
      parts.push(current);
      current = '';
    } else {
      current += character;
    }
  }
  parts.push(current);
  return parts;
}

function tokens(segment) {
  const words = [];
  const pattern = /"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g;
  for (const match of segment.matchAll(pattern)) words.push(match[1] ?? match[2] ?? match[3]);
  return words;
}

const isNoVerify = (token) => token.length >= '--no-v'.length && '--no-verify'.startsWith(token);
const hooksPathKey = (setting) => setting.split('=')[0].toLowerCase() === 'core.hookspath';

function commitClusterHasN(token) {
  if (!/^-[A-Za-z]+$/.test(token)) return false;
  for (const letter of token.slice(1)) {
    if (letter === 'n') return true;
    if (COMMIT_SHORT_WITH_VALUE.has(letter)) return false;
  }
  return false;
}

function segmentReason(words) {
  let index = 0;
  if (words[index] === 'env') index += 1;
  for (; index < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index]); index += 1) {
    if (/^HUSKY=0$/.test(words[index])) return 'HUSKY=0 skips the repository\'s git hooks.';
  }
  if (words[index] !== 'git') return null;
  index += 1;
  for (; index < words.length && words[index].startsWith('-'); index += 1) {
    const option = words[index];
    if (option === '-c' && hooksPathKey(words[index + 1] ?? '')) return 'Overriding core.hooksPath skips the repository\'s git hooks.';
    if (GIT_VALUE_OPTIONS.has(option)) index += 1;
  }
  const subcommand = words[index];
  const rest = words.slice(index + 1);
  if (subcommand === 'config') {
    const reading = rest.some((word) => ['--get', '--get-all', '--list', '-l', '--unset'].includes(word));
    const settings = rest.filter((word) => !word.startsWith('-'));
    if (!reading && settings.length >= 2 && hooksPathKey(settings[0])) return 'Setting core.hooksPath skips the repository\'s git hooks.';
    return null;
  }
  if (!HOOKED_COMMANDS.has(subcommand)) return null;
  const takesValue = VALUE_OPTIONS[subcommand];
  for (let position = 0; position < rest.length; position += 1) {
    const word = rest[position];
    if (word === '--') break;
    if (takesValue.has(word)) { position += 1; continue; }
    if (isNoVerify(word)) return `--no-verify skips the repository's git hooks on git ${subcommand}.`;
    if (subcommand === 'commit' && commitClusterHasN(word)) return '-n is --no-verify on git commit and skips the repository\'s git hooks.';
  }
  return null;
}

export function bypassReason(command) {
  for (const segment of segments(command)) {
    const reason = segmentReason(tokens(segment));
    if (reason) return `Blocked: ${reason} Fix what the hook reports instead of skipping it.`;
  }
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runHook('block-no-verify', (input) => (input.tool_name === 'Bash' ? bypassReason(input.tool_input?.command ?? '') : null));
}
