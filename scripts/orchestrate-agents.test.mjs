import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as yaml from 'js-yaml';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  AGENT_NAMES,
  DEFAULT_ASSETS_ROOT,
  installAgents,
  parseArgs,
} from '../skills/engineering/orchestrate/scripts/install-agents.mjs';

const HOST_CONFIG = {
  claude: { assetDirectory: 'claude-agents', destination: ['.claude', 'agents'], extension: '.md' },
  codex: { assetDirectory: 'codex-agents', destination: ['.codex', 'agents'], extension: '.toml' },
};
const REPOSITORY_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const INSTALLER_PATH = join(REPOSITORY_ROOT, 'skills', 'engineering', 'orchestrate', 'scripts', 'install-agents.mjs');

test('Claude roles can load skills without gaining delegation or extra edit tools', () => {
  for (const name of AGENT_NAMES) {
    const text = readFileSync(join(DEFAULT_ASSETS_ROOT, 'claude-agents', `${name}.md`), 'utf8');
    const frontmatter = yaml.load(text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
    assert.ok(frontmatter.tools.includes('Skill'), `${name} cannot load skills`);
    assert.ok(!frontmatter.tools.includes('Agent'), `${name} can delegate`);
    if (['orchestrate-explorer', 'orchestrate-researcher', 'orchestrate-reviewer'].includes(name)) {
      for (const tool of ['Bash', 'PowerShell', 'Write', 'Edit']) {
        assert.ok(!frontmatter.tools.includes(tool), `${name} unexpectedly exposes ${tool}`);
      }
    }
  }
});

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'orchestrate-agents-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const assetsRoot = join(root, 'assets');
  const source = {};
  for (const [host, config] of Object.entries(HOST_CONFIG)) {
    const directory = join(assetsRoot, config.assetDirectory);
    mkdirSync(directory, { recursive: true });
    source[host] = directory;
    for (const name of AGENT_NAMES) {
      const file = join(directory, `${name}${config.extension}`);
      const content = host === 'claude'
        ? `---\nname: ${name}\ndescription: Fixture agent\nmodel: sonnet\n---\n\nWork as ${name}.\n`
        : `name = "${name}"\ndescription = "Fixture agent"\nmodel = "gpt-5.6-luna"\nmodel_reasoning_effort = "max"\n`;
      writeFileSync(file, content);
    }
  }
  const target = join(root, 'project');
  mkdirSync(target);
  return { root, assetsRoot, source, target };
}

function destination(target, host) {
  return join(target, ...HOST_CONFIG[host].destination);
}

function snapshotFiles(directory) {
  if (!existsSync(directory)) return [];
  return AGENT_NAMES.map((name) => {
    const suffix = directory.includes('.codex') ? '.toml' : '.md';
    const path = join(directory, `${name}${suffix}`);
    return existsSync(path) ? [path, readFileSync(path)] : null;
  }).filter(Boolean);
}

test('dry-run preflights all five files without creating destination directories', (t) => {
  const { source, target } = fixture(t);
  const result = installAgents({ host: 'claude', target, sourceDir: source.claude });

  assert.equal(result.dryRun, true);
  assert.equal(result.wouldCreate.length, AGENT_NAMES.length);
  assert.equal(result.unchanged.length, 0);
  assert.equal(existsSync(destination(target, 'claude')), false);
});

test('apply writes exactly the native destination for both hosts', (t) => {
  const { source, target } = fixture(t);
  for (const host of ['claude', 'codex']) {
    const hostTarget = join(target, host);
    mkdirSync(hostTarget);
    const result = installAgents({ host, target: hostTarget, sourceDir: source[host], apply: true });

    assert.equal(result.created.length, AGENT_NAMES.length);
    assert.equal(result.unchanged.length, 0);
    assert.deepEqual(
      AGENT_NAMES.map((name) => existsSync(join(destination(hostTarget, host), `${name}${HOST_CONFIG[host].extension}`))),
      AGENT_NAMES.map(() => true),
    );
    assert.equal(existsSync(join(hostTarget, host === 'claude' ? '.codex' : '.claude')), false);
  }
});

test('a repeat apply is idempotent and does not rewrite identical bytes', (t) => {
  const { source, target } = fixture(t);
  installAgents({ host: 'codex', target, sourceDir: source.codex, apply: true });
  const destinationPath = destination(target, 'codex');
  const before = snapshotFiles(destinationPath);
  const fixedTime = new Date('2020-01-01T00:00:00.000Z');
  for (const [path] of before) utimesSync(path, fixedTime, fixedTime);

  const result = installAgents({ host: 'codex', target, sourceDir: source.codex, apply: true });
  assert.equal(result.created.length, 0);
  assert.equal(result.unchanged.length, AGENT_NAMES.length);
  for (const [path, bytes] of before) {
    assert.deepEqual(readFileSync(path), bytes);
    assert.equal(lstatSync(path).mtimeMs, fixedTime.getTime());
  }
});

test('a later conflict fails preflight before any earlier file is created', (t) => {
  const { source, target } = fixture(t);
  const destinationDirectory = destination(target, 'claude');
  mkdirSync(destinationDirectory, { recursive: true });
  const conflicting = join(destinationDirectory, 'orchestrate-reviewer.md');
  writeFileSync(conflicting, 'different bytes\n');

  assert.throws(
    () => installAgents({ host: 'claude', target, sourceDir: source.claude, apply: true }),
    /Conflicting destination file already exists/,
  );
  assert.equal(existsSync(join(destinationDirectory, 'orchestrate-explorer.md')), false);
  assert.equal(readFileSync(conflicting, 'utf8'), 'different bytes\n');
});

test('argument parsing requires host and target and rejects unknown options', () => {
  assert.deepEqual(parseArgs(['--host', 'claude', '--target', 'project']), {
    help: false,
    apply: false,
    host: 'claude',
    target: 'project',
  });
  assert.deepEqual(parseArgs(['--help']), { help: true, apply: false, host: undefined, target: undefined });
  assert.throws(() => parseArgs([]), /--host/);
  assert.throws(() => parseArgs(['--host', 'claude']), /--target/);
  assert.throws(() => parseArgs(['--host', 'other', '--target', 'project']), /Unsupported host/);
  assert.throws(() => parseArgs(['--host', 'claude', '--target', 'project', '--unknown']), /Unknown argument/);
});

function tryDirectorySymlink(linkPath, targetPath) {
  try {
    symlinkSync(targetPath, linkPath, process.platform === 'win32' ? 'junction' : 'dir');
    return true;
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP', 'EINVAL'].includes(error?.code)) return false;
    throw error;
  }
}

test('destination symlink escape is rejected before any writes when supported', (t) => {
  const { root, source, target } = fixture(t);
  const outside = join(root, 'outside');
  mkdirSync(outside);
  const link = join(target, '.claude');
  if (!tryDirectorySymlink(link, outside)) {
    t.skip('directory symlinks are unavailable in this environment');
    return;
  }

  assert.throws(
    () => installAgents({ host: 'claude', target, sourceDir: source.claude, apply: true }),
    /symlink|escapes/i,
  );
  assert.deepEqual(snapshotFiles(outside), []);
});

test('checked-in canonical assets contain exactly the five expected native names', () => {
  for (const [host, config] of Object.entries(HOST_CONFIG)) {
    const directory = join(DEFAULT_ASSETS_ROOT, config.assetDirectory);
    assert.equal(existsSync(directory), true, `missing canonical ${host} asset directory`);
    for (const name of AGENT_NAMES) {
      const path = join(directory, `${name}${config.extension}`);
      assert.equal(existsSync(path), true, `missing canonical ${host} asset ${name}`);
      assert.equal(lstatSync(path).isFile(), true, `canonical ${host} asset is not a file: ${name}`);
    }
  }
});

test('Claude plugin manifest references the five checked-in Claude definitions', () => {
  const manifestPath = join(REPOSITORY_ROOT, '.claude-plugin', 'plugin.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const expected = AGENT_NAMES.map((name) => `./skills/engineering/orchestrate/assets/claude-agents/${name}.md`);
  assert.deepEqual(manifest.agents, expected);
  for (const entry of expected) {
    assert.equal(existsSync(join(REPOSITORY_ROOT, ...entry.slice(2).split('/'))), true, `missing manifest agent: ${entry}`);
  }
});

test('CLI entry guard runs when the installer is invoked through a directory junction or symlink', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'orchestrate-agents-cli-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const aliasDirectory = join(root, 'alias');
  if (!tryDirectorySymlink(aliasDirectory, dirname(INSTALLER_PATH))) {
    t.skip('directory symlinks are unavailable in this environment');
    return;
  }

  const result = spawnSync(process.execPath, [join(aliasDirectory, 'install-agents.mjs'), '--help'], {
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Usage: node install-agents\.mjs/);
});
