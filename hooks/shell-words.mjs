// Split a shell command into segments and words well enough to tell a command from text quoted inside one.
export function segments(command) {
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

export function tokens(segment) {
  const words = [];
  const pattern = /"((?:\\.|[^"\\])*)"|'([^']*)'|(\S+)/g;
  for (const match of segment.matchAll(pattern)) words.push(match[1] ?? match[2] ?? match[3]);
  return words;
}

const WRAPPERS = new Set(['sudo', 'env', 'command', 'exec', 'time', 'nohup']);
const SUDO_VALUE_OPTIONS = new Set(['-u', '-g', '-h', '-p', '-C', '-D', '-R', '-T', '-U']);

// Drop `sudo -E`, `env`, and `NAME=value` prefixes so the first word is the program that runs.
export function program(words) {
  let index = 0;
  while (index < words.length) {
    const word = words[index];
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) { index += 1; continue; }
    if (!WRAPPERS.has(word)) break;
    index += 1;
    while (index < words.length && words[index].startsWith('-') && words[index] !== '--') {
      index += word === 'sudo' && SUDO_VALUE_OPTIONS.has(words[index]) ? 2 : 1;
    }
    if (words[index] === '--') index += 1;
  }
  return words.slice(index);
}

const GIT_VALUE_OPTIONS = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path']);

// For `git [global options] <subcommand> ...`, return the subcommand, its arguments, and any -C directory.
export function gitCall(words) {
  const run = program(words);
  if (run[0] !== 'git') return null;
  let index = 1;
  let directory = null;
  for (; index < run.length && run[index].startsWith('-'); index += 1) {
    if (run[index] === '-C') directory = run[index + 1] ?? null;
    if (GIT_VALUE_OPTIONS.has(run[index])) index += 1;
  }
  return run[index] ? { subcommand: run[index], rest: run.slice(index + 1), directory } : null;
}
