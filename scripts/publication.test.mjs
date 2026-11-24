import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8');
const manifest = JSON.parse(read('.claude-plugin', 'plugin.json'));
const readme = read('README.md');

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const skillDirectories = manifest.skills.map((entry) => join(ROOT, entry));

test('every agent file is in the manifest and both agent indexes', () => {
  const agentsIndex = read('agents', 'README.md');
  const registered = new Set(manifest.agents.map((entry) => join(ROOT, entry)));
  const files = walk(join(ROOT, 'skills')).filter((path) => dirname(path).endsWith(join('assets', 'claude-agents')));
  assert.ok(files.length > 0);
  for (const file of files) {
    const name = basename(file, '.md');
    assert.ok(registered.has(file), `${name} is not in plugin.json`);
    if (name.startsWith('orchestrate-')) continue; // indexed as a group
    assert.ok(agentsIndex.includes(`[${name}]`), `${name} is not in agents/README.md`);
    assert.ok(readme.includes(`| \`${name}\` |`), `${name} is not in the README agent table`);
  }
});

test('every hook command points at a script that exists and is in the README hook table', () => {
  const hooks = JSON.parse(read('hooks', 'hooks.json')).hooks;
  const commands = Object.values(hooks).flat().flatMap((group) => group.hooks.map((hook) => hook.command));
  assert.ok(commands.length > 0);
  for (const command of commands) {
    const script = command.match(/hooks\/([\w-]+)\.mjs/);
    assert.ok(script, `unrecognised hook command: ${command}`);
    assert.ok(existsSync(join(ROOT, 'hooks', `${script[1]}.mjs`)), `missing hook script: ${script[1]}`);
    assert.ok(readme.includes(`| \`${script[1]}\` |`), `${script[1]} is not in the README hook table`);
    assert.ok(readme.includes(`CAPSULE_HOOKS_DISABLED=${script[1]}`), `${script[1]} has no off switch in the README`);
  }
});

test('the README skills badge matches the manifest', () => {
  const badge = readme.match(/badge\/skills-(\d+)-/);
  assert.ok(badge, 'skills badge not found');
  assert.equal(Number(badge[1]), manifest.skills.length);
});

test('every reference file is linked from its skill or another of its references', () => {
  for (const skill of skillDirectories) {
    const references = join(skill, 'references');
    if (!existsSync(references)) continue;
    const files = walk(references);
    const sources = [join(skill, 'SKILL.md'), ...files.filter((path) => path.endsWith('.md'))];
    for (const file of files) {
      const name = basename(file);
      const linked = sources.some((source) => source !== file && readFileSync(source, 'utf8').includes(name));
      assert.ok(linked, `${file.slice(ROOT.length + 1)} is linked from nowhere in its skill`);
    }
  }
});
