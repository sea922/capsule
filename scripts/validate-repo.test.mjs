import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { validateRepository } from './validate-repo.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'skills-validation-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const put = (path, content) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), typeof content === 'string' ? content : JSON.stringify(content));
  };
  put('package.json', { name: 'sample', version: '1.0.0' });
  put('package-lock.json', { version: '1.0.0', packages: { '': { version: '1.0.0' } } });
  put('.claude-plugin/plugin.json', { name: 'sample', version: '1.0.0', skills: ['./skills/engineering/sample'] });
  put('.claude-plugin/marketplace.json', { plugins: [{ name: 'sample', source: './' }] });
  put('skills/engineering/sample/SKILL.md', '---\nname: sample\ndescription: Applies example conventions.\n---\n# Sample\n');
  put('README.md', '[sample](docs/engineering/sample.md)');
  put('skills/engineering/README.md', '[sample](../../docs/engineering/sample.md)');
  put('docs/engineering/sample.md', '[Instructions](../../skills/engineering/sample/SKILL.md)');
  return { root, put };
}

test('accepts a complete published skill', (t) => {
  assert.deepEqual(validateRepository(fixture(t).root), []);
});

test('rejects version drift', (t) => {
  const { root, put } = fixture(t);
  put('package.json', { name: 'sample', version: '2.0.0' });
  assert.ok(validateRepository(root).some((e) => e.includes('version')));
});

test('rejects invalid metadata and an unlisted skill', (t) => {
  const { root, put } = fixture(t);
  put('skills/engineering/extra/SKILL.md', '---\nname: Wrong\ndescription: ""\n---\n');
  const errors = validateRepository(root).join('\n');
  assert.match(errors, /name/);
  assert.match(errors, /description/);
  assert.match(errors, /manifest/);
});

test('rejects duplicate and escaping manifest paths', (t) => {
  const { root, put } = fixture(t);
  put('.claude-plugin/plugin.json', { name: 'sample', version: '1.0.0', skills: ['./skills/engineering/sample', './skills/engineering/sample', '../outside'] });
  const errors = validateRepository(root).join('\n');
  assert.match(errors, /duplicate/);
  assert.match(errors, /path/);
});

test('rejects missing documentation links, ignores illustrative code', (t) => {
  const { root, put } = fixture(t);
  put('docs/engineering/sample.md', '```md\n[example](missing-example.md)\n```\n[real](missing.md)');
  const errors = validateRepository(root).join('\n');
  assert.match(errors, /missing.md/);
  assert.doesNotMatch(errors, /missing-example/);
});

test('rejects malformed evals and missing fixture files', (t) => {
  const { root, put } = fixture(t);
  put('skills/engineering/sample/evals/evals.json', { skill_name: 'other', evals: [{ id: 1, prompt: 'Try it', expected_output: 'Result', files: ['evals/missing.txt'] }] });
  const errors = validateRepository(root).join('\n');
  assert.match(errors, /skill_name/);
  assert.match(errors, /missing.txt/);
});

test('accepts backtick README labels and rejects unsafe workflow defaults', (t) => {
  const { root, put } = fixture(t);
  put('skills/engineering/README.md', '[`sample`](../../docs/engineering/sample.md)');
  assert.deepEqual(validateRepository(root), []);
  put('.github/workflows/ci.yml', 'name: CI\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@main\n');
  const errors = validateRepository(root).join('\n');
  assert.match(errors, /permissions/);
  assert.match(errors, /timeout/);
  assert.match(errors, /commit SHA/);
});
