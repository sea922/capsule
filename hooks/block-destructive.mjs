import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from './hook-input.mjs';
import { gitCall, pieces, program, tokens } from './shell-words.mjs';

// Stops a short list of commands that destroy far more than a task usually intends. It catches casual
// mistakes, not a determined bypass: it is not a security boundary. Ordinary cleanup (rm -rf dist,
// git reset --hard, git clean, DROP TABLE) is deliberately left alone, and so are dry runs and --help.
const PROTECTED_BRANCHES = new Set(['main', 'master']);
const SHELLS = new Set(['sh', 'bash', 'zsh', 'dash', 'ksh']);
const SQL_CLIENTS = new Set(['psql', 'mysql', 'mariadb', 'sqlite3', 'sqlcmd', 'cockroach', 'duckdb', 'clickhouse-client']);
// Programs that run a command somewhere else, so a SQL client can appear among their arguments.
const REMOTE_RUNNERS = new Set(['docker', 'podman', 'nerdctl', 'docker-compose', 'kubectl', 'ssh']);
const DROP_DATABASE = /\bdrop\s+database\b/i;
const PUSH_VALUE_OPTIONS = new Set(['-o', '--push-option', '--receive-pack', '--exec', '--repo']);
const KUBECTL_VALUE_OPTIONS = new Set(['-n', '--namespace', '--context', '--kubeconfig', '--cluster', '--user', '-s',
  '--server', '--as', '-l', '--selector', '-f', '--filename', '-k', '--kustomize', '-o', '--output', '--field-selector',
  '--grace-period', '--timeout', '--cascade']);
const CONTAINER_VALUE_OPTIONS = new Set(['--context', '-c', '-H', '--host', '--config', '-l', '--log-level', '--tlscacert',
  '--tlscert', '--tlskey', '--connection', '--url', '--identity']);
const NAMESPACE_KINDS = new Set(['namespace', 'namespaces', 'ns']);
const HOME_DIRECTORIES = new Set(['~', '$HOME', '${HOME}']);

const shortFlags = (words) => words.filter((word) => /^-[A-Za-z]+$/.test(word)).join('');
const isParentChain = (path) => /^(\.\.\/)*\.\.$/.test(path);
const isDryRun = (args) => args.some((word) => word === '--dry-run' || (/^--dry-run=/.test(word) && !/=(none|false)$/.test(word)));

// After `cd build`, `rm -rf ./*` empties that directory, which is ordinary cleanup. A `cd` to root, home,
// a parent, or nowhere does not count.
function entersWorkDirectory(args) {
  const target = args.find((word) => word !== '--' && !/^-[LPe@]+$/.test(word));
  if (!target || target === '-') return false;
  const path = target.replace(/\/+$/, '');
  return path !== '' && path !== '.' && !HOME_DIRECTORIES.has(path) && !['$PWD', '${PWD}'].includes(path) && !isParentChain(path);
}

function wipesBroadly(target, inWorkDirectory) {
  if (target === '*') return !inWorkDirectory;
  let base = target.endsWith('/*') ? target.slice(0, -2) : target;
  base = base.replace(/\/+$/, '');
  if (base === '') return target.startsWith('/');
  if (base === '.') return !inWorkDirectory;
  return HOME_DIRECTORIES.has(base) || isParentChain(base);
}

function removeReason(args, inWorkDirectory) {
  const end = args.indexOf('--');
  const before = end === -1 ? args : args.slice(0, end);
  const options = before.filter((word) => word.startsWith('-'));
  const targets = [...before.filter((word) => !word.startsWith('-')), ...(end === -1 ? [] : args.slice(end + 1))];
  const short = shortFlags(options);
  const recursive = /[rR]/.test(short) || options.includes('--recursive');
  const force = short.includes('f') || options.includes('--force');
  const target = recursive && force ? targets.find((word) => wipesBroadly(word, inWorkDirectory)) : undefined;
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
  const short = shortFlags(options);
  if (options.includes('--dry-run') || short.includes('n')) return null;
  const force = options.includes('--force') || short.includes('f');
  const deletes = options.includes('--delete') || short.includes('d');
  const refspecs = positionals.slice(1);
  for (const refspec of refspecs) {
    const body = refspec.replace(/^\+/, '');
    let destination = body.split(':').pop().replace(/^refs\/heads\//, '');
    if (destination === 'HEAD' || destination === '@') destination = currentBranch(directory);
    if (!PROTECTED_BRANCHES.has(destination)) continue;
    if (deletes || body.startsWith(':')) return `this push deletes ${destination} on the remote`;
    if (force || refspec.startsWith('+')) return `a force push overwrites history on ${destination}`;
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
  if (isDryRun(args)) return null;
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
  let start = 0;
  while (start < args.length && args[start].startsWith('-')) start += CONTAINER_VALUE_OPTIONS.has(args[start]) ? 2 : 1;
  const [area, action] = args.slice(start).filter((word) => !word.startsWith('-'));
  if (action !== 'prune') return null;
  if (area === 'volume') return `${tool} volume prune deletes data volumes`;
  return area === 'system' && args.includes('--volumes') ? `${tool} system prune --volumes deletes data volumes` : null;
}

// A SQL client that is handed DROP DATABASE in its own arguments, its heredoc, or the pipeline feeding it.
function databaseReason(parts, position) {
  const [tool, ...args] = program(tokens(parts[position].text));
  const isClient = (word) => SQL_CLIENTS.has(word) || word === 'dropdb';
  const client = isClient(tool) ? tool : REMOTE_RUNNERS.has(tool) ? args.find(isClient) : undefined;
  if (!client || args.includes('--help')) return null;
  if (client === 'dropdb') return 'dropdb deletes a whole database';
  let input = `${parts[position].text}\n${parts[position].heredoc ?? ''}`;
  for (let index = position; index > 0 && parts[index].operator === '|'; index -= 1) {
    input += `\n${parts[index - 1].text}\n${parts[index - 1].heredoc ?? ''}`;
  }
  return DROP_DATABASE.test(input) ? 'DROP DATABASE deletes a whole database' : null;
}

function segmentReason(part, state, currentBranch) {
  const run = program(tokens(part.text));
  const [tool, ...args] = run;
  if (!tool) return null;
  if (tool === 'cd' || tool === 'pushd') {
    state.inWorkDirectory = entersWorkDirectory(args);
    return null;
  }
  if (SHELLS.has(tool)) {
    const flag = args.findIndex((word) => /^-[A-Za-z]*c$/.test(word));
    return commandReason(flag === -1 ? part.heredoc ?? '' : args[flag + 1] ?? '', currentBranch);
  }
  if (args.includes('--help') || args.includes('-h')) return null;
  if (tool === 'rm') return removeReason(args, state.inWorkDirectory);
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
  const parts = pieces(command);
  const state = { inWorkDirectory: false };
  for (let position = 0; position < parts.length; position += 1) {
    const reason = segmentReason(parts[position], state, currentBranch) ?? databaseReason(parts, position);
    if (reason) return reason;
  }
  return null;
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
