// Split a shell command into segments and words well enough to tell a command from text quoted inside one.
// This is a reading aid for the hooks, not a shell parser: it stops casual mistakes and is not a security boundary.
const HEREDOC = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z_][A-Za-z0-9_]*))/;

// `<<` inside `$(( … ))` is a shift, not a heredoc.
const inArithmetic = (text, index) => text.lastIndexOf('((', index) > text.lastIndexOf('))', index);

// Each piece is one command: its text, the operator before it (`|`, `&&`, `;`, `(`, a newline, ...), and the
// body of any heredoc it reads. Heredoc bodies, comments, and quoted text never become commands of their own.
export function pieces(command) {
  const text = typeof command === 'string' ? command.replace(/\\\r?\n/g, '') : '';
  const parts = [];
  const pending = [];
  let current = '';
  let operator = null;
  let quote = null;
  const push = (next) => {
    parts.push({ text: current, operator });
    current = '';
    operator = next;
  };
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      if (character === '\\' && quote === '"') { current += character + (text[index + 1] ?? ''); index += 1; continue; }
      if (character === quote) quote = null;
      current += character;
    } else if (character === '\\') {
      current += character + (text[index + 1] ?? '');
      index += 1;
    } else if (character === '"' || character === "'") {
      quote = character;
      current += character;
    } else if (character === '#' && (current === '' || /\s$/.test(current))) {
      while (index + 1 < text.length && text[index + 1] !== '\n') index += 1;
    } else if (character === '<' && text.startsWith('<<<', index)) {
      current += '<<<';
      index += 2;
    } else if (character === '<' && text[index + 1] === '<' && !inArithmetic(text, index) && HEREDOC.test(text.slice(index, index + 200))) {
      const match = HEREDOC.exec(text.slice(index, index + 200));
      pending.push({ word: match[2] ?? match[3] ?? match[4], stripTabs: match[1] === '-', piece: parts.length });
      current += match[0];
      index += match[0].length - 1;
    } else if (character === '\n') {
      push('\n');
      let position = index + 1;
      for (const heredoc of pending.splice(0)) {
        let body = '';
        while (position < text.length) {
          const newline = text.indexOf('\n', position);
          const end = newline === -1 ? text.length : newline;
          const line = text.slice(position, end);
          position = end + 1;
          if ((heredoc.stripTabs ? line.replace(/^\t+/, '') : line) === heredoc.word) break;
          body += `${line}\n`;
        }
        parts[heredoc.piece].heredoc = (parts[heredoc.piece].heredoc ?? '') + body;
      }
      index = position - 1;
    } else if (character === '&' && (/[<>]$/.test(current) || text[index + 1] === '>')) {
      current += character; // a redirect such as 2>&1 or &>file, not a separator
    } else if (character === ';' || character === '|' || character === '&') {
      const doubled = text[index + 1] === character;
      if (doubled || (character === '|' && text[index + 1] === '&')) index += 1;
      push(doubled ? character + character : character);
    } else if (character === '(' || character === ')' || character === '`') {
      push(character);
    } else {
      current += character;
    }
  }
  push(null);
  return parts;
}

export function segments(command) {
  return pieces(command).map((piece) => piece.text);
}

// Words of one segment. Adjacent quoted and unquoted parts form one word, as in a shell: "$DIR"/* is one word.
export function tokens(segment) {
  const text = typeof segment === 'string' ? segment : '';
  const words = [];
  let word = '';
  let started = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '\\') {
      if (index + 1 < text.length) { word += text[index + 1]; started = true; index += 1; }
    } else if (character === '"') {
      started = true;
      for (index += 1; index < text.length && text[index] !== '"'; index += 1) {
        if (text[index] === '\\' && index + 1 < text.length) { word += text[index]; index += 1; }
        word += text[index];
      }
    } else if (character === "'") {
      started = true;
      const close = text.indexOf("'", index + 1);
      const end = close === -1 ? text.length : close;
      word += text.slice(index + 1, end);
      index = end;
    } else if (/\s/.test(character)) {
      if (started) words.push(word);
      word = '';
      started = false;
    } else if (character === '#' && !started) {
      break;
    } else {
      word += character;
      started = true;
    }
  }
  if (started) words.push(word);
  return words;
}

const KEYWORDS = new Set(['(', '{', '!', 'then', 'do', 'else', 'elif', 'if', 'while', 'until']);
const NO_VALUES = new Set();
// Wrappers that run another program, with the options of each that take a separate value.
const WRAPPERS = new Map([
  ['sudo', new Set(['-u', '-g', '-h', '-p', '-C', '-D', '-R', '-T', '-U'])],
  ['doas', new Set(['-u', '-C'])],
  ['env', new Set(['-u', '--unset', '-C', '--chdir'])],
  ['nice', new Set(['-n', '--adjustment'])],
  ['xargs', new Set(['-n', '-I', '-P', '-L', '-d', '-s', '-E', '-a'])],
  ['time', new Set(['-f', '-o'])],
  ['exec', new Set(['-a'])],
  ['command', NO_VALUES],
  ['builtin', NO_VALUES],
  ['nohup', NO_VALUES],
]);

// `/bin/rm` and `\rm` run `rm`.
function baseName(word) {
  return word.replace(/^\\/, '').split('/').pop() || word;
}

// Drop shell keywords, `sudo -E`, `env`, and `NAME=value` prefixes so the first word is the program that runs.
export function program(words) {
  let index = 0;
  while (index < words.length) {
    const word = words[index];
    if (KEYWORDS.has(word) || /^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) { index += 1; continue; }
    const valued = WRAPPERS.get(baseName(word));
    if (!valued) break;
    index += 1;
    while (index < words.length && words[index].startsWith('-') && words[index] !== '--') {
      index += valued.has(words[index]) ? 2 : 1;
    }
    if (words[index] === '--') index += 1;
  }
  const run = words.slice(index);
  if (run.length > 0) run[0] = baseName(run[0]);
  return run;
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
