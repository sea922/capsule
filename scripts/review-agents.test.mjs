import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import * as yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const READ_ONLY = ['code-review-silent-failures', 'code-review-type-design', 'code-review-comments', 'code-review-tests', 'java-reviewer', 'database-migrations-reviewer', 'benchmark-auditor', 'production-readiness-auditor',
  'security-review-sanitizer', 'adlc-spec-miner', 'performance-reviewer', 'accessibility-reviewer'];

test('read-only review and spec agents are registered and cannot edit, run commands, or delegate', () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
  const registered = new Map(manifest.agents.map((path) => [basename(path, '.md'), path]));
  for (const name of READ_ONLY) {
    assert.ok(registered.has(name), `${name} is not in plugin.json`);
    const text = readFileSync(join(ROOT, registered.get(name)), 'utf8');
    const frontmatter = yaml.load(text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
    assert.equal(frontmatter.name, name);
    assert.ok(frontmatter.description, `${name} has no description`);
    assert.deepEqual([...frontmatter.tools].sort(), ['Glob', 'Grep', 'Read', 'Skill'], `${name} tools changed`);
  }
});
