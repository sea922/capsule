import {
  closeSync,
  mkdirSync,
  openSync,
  readFileSync,
  lstatSync,
  realpathSync,
  writeSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const AGENT_NAMES = Object.freeze([
  'orchestrate-explorer',
  'orchestrate-researcher',
  'orchestrate-worker',
  'orchestrate-tester',
  'orchestrate-reviewer',
]);

const HOSTS = Object.freeze({
  claude: Object.freeze({
    assetDirectory: 'claude-agents',
    destinationParts: Object.freeze(['.claude', 'agents']),
    extension: '.md',
  }),
  codex: Object.freeze({
    assetDirectory: 'codex-agents',
    destinationParts: Object.freeze(['.codex', 'agents']),
    extension: '.toml',
  }),
});

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_ASSETS_ROOT = resolve(SCRIPT_DIRECTORY, '..', 'assets');

export const HELP_TEXT = `Usage: node install-agents.mjs --host <claude|codex> --target <existing-project-dir> [--apply]

Install the five project-local orchestrate agent definitions for one native host.
Without --apply, the command only performs preflight checks and reports changes.

Options:
  --host <claude|codex>  Native host whose definitions should be installed.
  --target <directory>   Existing project directory receiving the definitions.
  --apply                Create missing destination files after preflight.
  --help                 Show this help text.

The installer never edits global configuration, overwrites an existing file, or
copies files outside the fixed five-name manifest.
`;

function fail(message) {
  throw new Error(message);
}

function assertString(value, label) {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} must be a non-empty string`);
  return value;
}

function pathKey(path) {
  const normalized = resolve(path);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function isInside(root, candidate) {
  const rootKey = pathKey(root);
  const candidateKey = pathKey(candidate);
  const child = relative(rootKey, candidateKey);
  return child === '' || (child !== '..' && !child.startsWith(`..${sep}`) && !isAbsolute(child));
}

function lstatOrNull(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function checkedRealpath(path, label) {
  try {
    return realpathSync(path);
  } catch (error) {
    throw new Error(`Unable to resolve ${label} ${path}: ${error.message}`, { cause: error });
  }
}

function assertDirectoryInsideTarget(path, targetRoot, label) {
  const stat = lstatOrNull(path);
  if (!stat) return { exists: false, path };
  if (stat.isSymbolicLink()) fail(`Refusing symlink ${label}: ${path}`);
  if (!stat.isDirectory()) fail(`${label} is not a directory: ${path}`);
  const resolvedPath = checkedRealpath(path, label);
  if (!isInside(targetRoot, resolvedPath)) {
    fail(`${label} escapes the resolved target directory: ${path}`);
  }
  return { exists: true, path, resolvedPath };
}

function inspectDestinationDirectory(targetRoot, destinationParts) {
  let current = targetRoot;
  let firstMissing = null;

  for (const part of destinationParts) {
    current = join(current, part);
    if (firstMissing) continue;
    const checked = assertDirectoryInsideTarget(current, targetRoot, 'destination directory');
    if (!checked.exists) firstMissing = current;
  }

  return {
    path: join(targetRoot, ...destinationParts),
    exists: firstMissing === null,
    firstMissing,
  };
}

function inspectDestinationFile(path, targetRoot, expectedBytes) {
  if (!isInside(targetRoot, path)) fail(`Destination path escapes the resolved target directory: ${path}`);
  const stat = lstatOrNull(path);
  if (!stat) return { state: 'create', path };
  if (stat.isSymbolicLink()) fail(`Refusing symlink destination file: ${path}`);
  if (!stat.isFile()) fail(`Destination path is not a regular file: ${path}`);
  const resolvedPath = checkedRealpath(path, 'destination file');
  if (!isInside(targetRoot, resolvedPath)) {
    fail(`Destination file escapes the resolved target directory: ${path}`);
  }
  const actualBytes = readFileSync(path);
  if (actualBytes.equals(expectedBytes)) return { state: 'unchanged', path };
  fail(`Conflicting destination file already exists: ${path}`);
}

function assertSourceDirectory(sourceDirectory) {
  const stat = lstatOrNull(sourceDirectory);
  if (!stat) fail(`Agent asset directory does not exist: ${sourceDirectory}`);
  if (stat.isSymbolicLink()) fail(`Refusing symlink agent asset directory: ${sourceDirectory}`);
  if (!stat.isDirectory()) fail(`Agent asset path is not a directory: ${sourceDirectory}`);
  return checkedRealpath(sourceDirectory, 'agent asset directory');
}

function readAssetFiles(host, sourceDirectory) {
  const configuration = HOSTS[host];
  const sourceRoot = assertSourceDirectory(sourceDirectory);

  return AGENT_NAMES.map((name) => {
    const filename = `${name}${configuration.extension}`;
    const sourcePath = join(sourceRoot, filename);
    const stat = lstatOrNull(sourcePath);
    if (!stat) fail(`Missing canonical agent asset: ${sourcePath}`);
    if (stat.isSymbolicLink()) fail(`Refusing symlink canonical agent asset: ${sourcePath}`);
    if (!stat.isFile()) fail(`Canonical agent asset is not a regular file: ${sourcePath}`);
    const resolvedPath = checkedRealpath(sourcePath, 'canonical agent asset');
    if (!isInside(sourceRoot, resolvedPath)) {
      fail(`Canonical agent asset escapes its asset directory: ${sourcePath}`);
    }
    return {
      name,
      filename,
      sourcePath,
      bytes: readFileSync(sourcePath),
    };
  });
}

function resolveSourceDirectory(host, options) {
  const sourceDirectory = options.sourceDir ?? options.sourceDirectory ?? options.sourceRoot;
  if (sourceDirectory !== undefined) return resolve(assertString(sourceDirectory, 'sourceDir'));
  const assetsRoot = options.assetsRoot ?? options.assetRoot ?? DEFAULT_ASSETS_ROOT;
  return join(resolve(assertString(assetsRoot, 'assetsRoot')), HOSTS[host].assetDirectory);
}

function normalizeInstallOptions(options = {}) {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    fail('Installer options must be an object');
  }
  const host = options.host;
  if (typeof host !== 'string' || !Object.hasOwn(HOSTS, host)) {
    fail(`Unsupported host: ${host ?? '(missing)'}. Expected claude or codex`);
  }
  const targetInput = options.target ?? options.targetDir;
  assertString(targetInput, 'target');
  const targetPath = resolve(targetInput);
  const apply = options.apply === true && options.dryRun !== true;
  return {
    host,
    targetPath,
    sourceDirectory: resolveSourceDirectory(host, options),
    apply,
  };
}

function assertTargetDirectory(targetPath) {
  const stat = lstatOrNull(targetPath);
  if (!stat) fail(`Target project directory does not exist: ${targetPath}`);
  if (stat.isSymbolicLink()) fail(`Refusing symlink target project directory: ${targetPath}`);
  if (!stat.isDirectory()) fail(`Target project path is not a directory: ${targetPath}`);
  return checkedRealpath(targetPath, 'target project directory');
}

/**
 * Read all source and destination paths and return a write plan without making
 * any filesystem changes. Every expected destination is checked before the
 * plan is returned, so a later conflict cannot follow an earlier write.
 */
export function preflight(options = {}) {
  const normalized = normalizeInstallOptions(options);
  const targetRoot = assertTargetDirectory(normalized.targetPath);
  const configuration = HOSTS[normalized.host];
  const sourceRoot = resolve(normalized.sourceDirectory);
  const assets = readAssetFiles(normalized.host, sourceRoot);
  const destinationDirectory = inspectDestinationDirectory(targetRoot, configuration.destinationParts);
  const files = assets.map((asset) => {
    const destinationPath = join(destinationDirectory.path, asset.filename);
    const destination = inspectDestinationFile(destinationPath, targetRoot, asset.bytes);
    return {
      name: asset.name,
      filename: asset.filename,
      sourcePath: asset.sourcePath,
      destinationPath,
      bytes: asset.bytes,
      state: destination.state,
    };
  });

  return {
    host: normalized.host,
    targetPath: normalized.targetPath,
    targetRoot,
    sourceRoot,
    destinationDirectory: destinationDirectory.path,
    destinationExists: destinationDirectory.exists,
    files,
    apply: normalized.apply,
    wouldCreate: files.filter((file) => file.state === 'create').map((file) => file.destinationPath),
    unchanged: files.filter((file) => file.state === 'unchanged').map((file) => file.destinationPath),
  };
}

function ensureDestinationDirectory(plan) {
  const parts = HOSTS[plan.host].destinationParts;
  let current = plan.targetRoot;
  const created = [];
  for (const part of parts) {
    current = join(current, part);
    let stat = lstatOrNull(current);
    if (!stat) {
      try {
        mkdirSync(current);
        created.push(current);
      } catch (error) {
        if (error?.code !== 'EEXIST') throw error;
      }
      stat = lstatOrNull(current);
    }
    if (!stat) fail(`Destination directory disappeared during apply: ${current}`);
    if (stat.isSymbolicLink()) fail(`Refusing symlink destination directory: ${current}`);
    if (!stat.isDirectory()) fail(`Destination path is not a directory: ${current}`);
    const resolvedPath = checkedRealpath(current, 'destination directory');
    if (!isInside(plan.targetRoot, resolvedPath)) {
      fail(`Destination directory escapes the resolved target directory: ${current}`);
    }
  }
  return created;
}

function assertDestinationDirectoryStillSafe(plan) {
  const checked = inspectDestinationDirectory(plan.targetRoot, HOSTS[plan.host].destinationParts);
  if (!checked.exists) fail(`Destination directory disappeared during apply: ${checked.path}`);
}

function compareRacedDestination(file) {
  const stat = lstatOrNull(file.destinationPath);
  if (!stat) return 'create';
  if (stat.isSymbolicLink()) fail(`Refusing symlink destination file: ${file.destinationPath}`);
  if (!stat.isFile()) fail(`Destination path is not a regular file: ${file.destinationPath}`);
  const resolvedPath = checkedRealpath(file.destinationPath, 'destination file');
  if (!isInside(file.targetRoot, resolvedPath)) {
    fail(`Destination file escapes the resolved target directory: ${file.destinationPath}`);
  }
  return readFileSync(file.destinationPath).equals(file.bytes) ? 'unchanged' : 'conflict';
}

function writeNewFile(file, targetRoot) {
  let descriptor;
  try {
    descriptor = openSync(file.destinationPath, 'wx', 0o644);
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const raced = compareRacedDestination({ ...file, targetRoot });
    if (raced === 'unchanged') return 'unchanged';
    if (raced === 'conflict') fail(`Conflicting destination file appeared during apply: ${file.destinationPath}`);
    throw new Error(`Destination changed during apply: ${file.destinationPath}`);
  }

  try {
    try {
      let offset = 0;
      while (offset < file.bytes.length) {
        const count = writeSync(descriptor, file.bytes, offset, file.bytes.length - offset, offset);
        if (count <= 0) fail(`Unable to write destination file: ${file.destinationPath}`);
        offset += count;
      }
    } finally {
      closeSync(descriptor);
    }
  } catch (error) {
    // The exclusive open created the path even if a later write or close fails.
    // Preserve that fact for the caller instead of attempting an unsafe delete.
    error.partialPath = file.destinationPath;
    throw error;
  }
  return 'created';
}

/**
 * Install the fixed agent set. The default is a dry run. Apply mode creates
 * missing files only; it never overwrites or deletes. If a write fails after a
 * file has been created, the error names the possible partial files and no
 * unsafe rollback is attempted.
 */
export function installAgents(options = {}) {
  const plan = preflight(options);
  if (!plan.apply) {
    return {
      ...plan,
      dryRun: true,
      created: [],
      changed: [],
      unchanged: plan.unchanged,
    };
  }

  const createdDirectories = ensureDestinationDirectory(plan);
  assertDestinationDirectoryStillSafe(plan);
  // Recheck all destinations after directory creation and before the first
  // file write, covering files that appeared after the initial preflight.
  for (const file of plan.files) {
    const state = inspectDestinationFile(file.destinationPath, plan.targetRoot, file.bytes).state;
    if (state !== file.state && !(file.state === 'create' && state === 'unchanged')) {
      fail(`Destination changed during apply: ${file.destinationPath}`);
    }
  }

  const created = [];
  const changed = [];
  const unchanged = [];
  try {
    for (const file of plan.files) {
      assertDestinationDirectoryStillSafe(plan);
      const state = file.state === 'unchanged' ? 'unchanged' : writeNewFile(file, plan.targetRoot);
      if (state === 'created') {
        created.push(file.destinationPath);
        changed.push(file.destinationPath);
      } else {
        unchanged.push(file.destinationPath);
      }
    }
  } catch (error) {
    const partialPaths = [...created];
    if (error.partialPath && !partialPaths.includes(error.partialPath)) partialPaths.push(error.partialPath);
    const partial = partialPaths.length ? ` Partial new files may remain: ${partialPaths.join(', ')}.` : '';
    error.message = `${error.message}${partial} No rollback was attempted.`;
    throw error;
  }

  return {
    ...plan,
    dryRun: false,
    created,
    changed,
    unchanged,
    createdDirectories,
  };
}

// Friendly aliases make the small module convenient for focused tests without
// exposing mutable implementation details.
export const runInstaller = installAgents;
export const createPlan = preflight;

export function parseArgs(argv = []) {
  if (!Array.isArray(argv)) fail('Arguments must be an array');
  let host;
  let target;
  let apply = false;
  let help = false;

  const takeValue = (name, value, index) => {
    if (value !== undefined) {
      if (!value || value.startsWith('--')) fail(`${name} requires a value`);
      return { value, nextIndex: index };
    }
    const next = argv[index + 1];
    if (next === undefined || next.startsWith('--')) fail(`${name} requires a value`);
    return { value: next, nextIndex: index + 1 };
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help') {
      help = true;
      continue;
    }
    if (argument === '--apply') {
      if (apply) fail('Duplicate argument: --apply');
      apply = true;
      continue;
    }
    if (argument === '--host' || argument.startsWith('--host=')) {
      if (host !== undefined) fail('Duplicate argument: --host');
      const inline = argument.startsWith('--host=') ? argument.slice('--host='.length) : undefined;
      const taken = takeValue('--host', inline, index);
      host = taken.value;
      index = taken.nextIndex;
      continue;
    }
    if (argument === '--target' || argument.startsWith('--target=')) {
      if (target !== undefined) fail('Duplicate argument: --target');
      const inline = argument.startsWith('--target=') ? argument.slice('--target='.length) : undefined;
      const taken = takeValue('--target', inline, index);
      target = taken.value;
      index = taken.nextIndex;
      continue;
    }
    fail(`Unknown argument: ${argument}`);
  }

  if (help) return { help: true, apply, host, target };
  if (host === undefined) fail('Missing required argument: --host');
  if (target === undefined) fail('Missing required argument: --target');
  if (!Object.hasOwn(HOSTS, host)) fail(`Unsupported host: ${host}. Expected claude or codex`);
  return { help: false, apply, host, target };
}

export function formatResult(result) {
  if (result.dryRun) {
    const creates = result.wouldCreate.length;
    const unchanged = result.unchanged.length;
    return `Dry run: ${creates} file${creates === 1 ? '' : 's'} would be created, ${unchanged} unchanged under ${result.destinationDirectory}. Use --apply to write.`;
  }
  return `Installed ${result.created.length} file${result.created.length === 1 ? '' : 's'}; ${result.unchanged.length} unchanged under ${result.destinationDirectory}.`;
}

export function main(argv = process.argv.slice(2), io = {}) {
  const stdout = io.stdout ?? ((message) => console.log(message));
  const stderr = io.stderr ?? ((message) => console.error(message));
  try {
    const options = parseArgs(argv);
    if (options.help) {
      stdout(HELP_TEXT);
      return 0;
    }
    const result = installAgents(options);
    stdout(formatResult(result));
    return 0;
  } catch (error) {
    stderr(`Error: ${error.message}`);
    return 1;
  }
}

if (import.meta.main) {
  process.exitCode = main();
}
