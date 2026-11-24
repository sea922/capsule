import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from './hook-input.mjs';
import { gitCall, program, segments, tokens } from './shell-words.mjs';

// Stops a short list of commands that destroy far more than a task usually intends. It catches casual
// mistakes, not a determined bypass: it is not a security boundary. Ordinary cleanup (rm -rf dist,
// git reset --hard, git clean) is deliberately left alone.
const PROTECTED_BRANCHES = new Set(['main', 'master']);
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh']);
const SQL_CLIENTS = new Set(['psql', 'mysql', 'mariadb', 'sqlite3', 'sqlcmd', 'cockroach', 'duckdb', 'clickhouse-client']);
const DROP_STATEMENT = /\bdrop\s+(database|schema)\b/i;
const PUSH_VALUE_OPTIONS = new Set(['-o', '--push-option', '--receive-pack', '--exec', '--repo']);
const KUBECTL_VALUE_OPTIONS = new Set(['-n', '--namespace', '--context', '--kubeconfig', '--cluster', '--user', '-s',
  '--server', '--as', '-l', '--selector', '-f', '--filename', '-k', '--kustomize', '-o', '--output', '--field-selector',
  '--grace-period', '--timeout', '--cascade']);
const NAMESPACE_KINDS = new Set(['namespace', 'namespaces', 'ns']);

const shortFlags = (words) => words.filter((word) => /^-[A-Za-z]+$/.test(word)).join('');

function wipesBroadly(target) {
  if (target === '*') return true;
  let base = target.endsWith('/*') ? target.slice(0, -2) : target;
  base = base.replace(/\/+$/, '');
  if (base === '') return target.startsWith('/');
  return ['~', '$HOME', '${HOME}', '.'].includes(base) || /^(\.\.\/)*\.\.$/.test(base);
}

function removeReason(args) {
  const end = args.indexOf('--');
  const options = end === -1 ? args.filter((word) => word.startsWith('-')) : args.slice(0, end).filter((word) => word.startsWith('-'));
  const targets = end === -1 ? args.filter((word) => !word.startsWith('-')) : [...args.slice(0, end).filter((word) => !word.startsWith('-')), ...args.slice(end + 1)];
  const short = shortFlags(options);
  const recursive = /[rR]/.test(short) || options.includes('--recursive');
  const force = short.includes('f') || options.includes('--force');
  const target = recursive && force ? targets.find(wipesBroadly) : undefined;
  return target ? `rm -rf ${target} deletes a whole root, home, parent, or current directory` : null;
}

function pushReason({ rest, directory }, currentBranch) {
  const positionals = [];
  const options = [];
  for (let index = 0; index < rest.length; index += 1) {
    if (PUSH_VALUE_OPTIONS.has(rest[index])) index += 1;
    else if (rest[index].startsWith('-')) options.push(rest[index]);
    else positionals.push(rest[index]);
  }
  const force = options.includes('--force') || shortFlags(options).includes('f');
  const refspecs = positionals.slice(1);
  for (const refspec of refspecs) {
    const destination = refspec.replace(/^\+/, '').split(':').pop().replace(/^refs\/heads\//, '');
    if (PROTECTED_BRANCHES.has(destination) && (force || refspec.startsWith('+'))) return `a force push overwrites history on ${destination}`;
  }
  if (!force) return null;
  if (options.includes('--all') || options.includes('--mirror')) return 'a force push of every branch overwrites history on the default branch';
  const branch = refspecs.length === 0 ? currentBranch(directory) : null;
  return PROTECTED_BRANCHES.has(branch) ? `a force push overwrites history on ${branch}` : null;
}

function infrastructureReason(tool, args) {
  const positionals = args.filter((word) => !word.startsWith('-'));
  const destroys = positionals[0] === 'destroy' || (tool === 'terragrunt' && positionals[1] === 'destroy')
    || (positionals[0] === 'apply' && args.some((word) => /^--?destroy$/.test(word)));
  return destroys ? `${tool} destroy removes real infrastructure` : null;
}

function kubectlReason(args) {
  const positionals = [];
  const options = [];
  for (let index = 0; index < args.length; index += 1) {
    if (KUBECTL_VALUE_OPTIONS.has(args[index])) index += 1;
    else if (args[index].startsWith('-')) options.push(args[index]);
    else positionals.push(args[index]);
  }
  if (positionals[0] !== 'delete') return null;
  const kinds = (positionals[1] ?? '').split(',').map((resource) => resource.split('/')[0].toLowerCase());
  if (kinds.some((kind) => NAMESPACE_KINDS.has(kind))) return 'kubectl delete namespace removes everything in the namespace';
  if (options.some((option) => option === '--all' || option === '--all=true')) return 'kubectl delete --all removes every resource of that kind';
  return null;
}

function containerReason(tool, args) {
  const [area, action] = args.filter((word) => !word.startsWith('-'));
  if (action !== 'prune') return null;
  if (area === 'volume') return `${tool} volume prune deletes data volumes`;
  const all = args.includes('--all') || shortFlags(args).includes('a');
  return area === 'system' && all && args.includes('--volumes') ? `${tool} system prune -a --volumes deletes images and data volumes` : null;
}

function segmentReason(words, currentBranch) {
  const run = program(words);
  const [tool, ...args] = run;
  if (!tool) return null;
  if (SHELLS.has(tool)) {
    const flag = args.findIndex((word) => /^-[A-Za-z]*c$/.test(word));
    return flag === -1 ? null : commandReason(args[flag + 1] ?? '', currentBranch);
  }
  if (tool === 'rm') return removeReason(args);
  if (tool === 'git') {
    const call = gitCall(run);
    return call?.subcommand === 'push' ? pushReason(call, currentBranch) : null;
  }
  if (tool === 'terraform' || tool === 'tofu' || tool === 'terragrunt') return infrastructureReason(tool, args);
  if (tool === 'kubectl') return kubectlReason(args);
  if (tool === 'docker' || tool === 'podman') return containerReason(tool, args);
  return null;
}

function commandReason(command, currentBranch) {
  const parts = segments(command).map(tokens);
  for (const words of parts) {
    const reason = segmentReason(words, currentBranch);
    if (reason) return reason;
  }
  const reachesDatabase = parts.some((words) => program(words).some((word) => SQL_CLIENTS.has(word)));
  return reachesDatabase && DROP_STATEMENT.test(command) ? 'DROP DATABASE or DROP SCHEMA deletes a whole database' : null;
}

export function destructiveReason(command, currentBranch = () => null) {
  const reason = commandReason(command, currentBranch);
  return reason
    ? `Blocked: ${reason}. Do not run it or work around this. If it is really intended, ask the user to run it themselves.`
    : null;
}

function branchIn(cwd) {
  return (directory) => {
    try {
      return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
        cwd: resolve(cwd, directory ?? '.'), encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000,
      }).trim();
    } catch {
      return null;
    }
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runHook('block-destructive', (input) => (input.tool_name === 'Bash'
    ? destructiveReason(input.tool_input?.command ?? '', branchIn(input.cwd ?? process.cwd()))
    : null));
}
