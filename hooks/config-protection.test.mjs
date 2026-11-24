import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { isProtectedConfig, protectionReason } from './config-protection.mjs';

test('lint and format configs are recognised by file name', () => {
  for (const name of ['.eslintrc.json', 'eslint.config.mjs', '.prettierrc', 'prettier.config.js', 'biome.jsonc',
    '.stylelintrc.yml', 'ruff.toml', '.ruff.toml', '.flake8', '.pylintrc', '.golangci.yml', '.rubocop.yml',
    '.swiftlint.yml', '.markdownlint.json', '.editorconfig', '.eslintignore', '.prettierignore']) {
    assert.ok(isProtectedConfig(`/repo/${name}`), name);
  }
  for (const name of ['package.json', 'tsconfig.json', 'pyproject.toml', 'src/eslint.ts', 'README.md', 'my.eslintrc.json']) {
    assert.equal(isProtectedConfig(`/repo/${name}`), false, name);
  }
});

test('editing an existing config is blocked but creating one is allowed', () => {
  const exists = () => true;
  const missing = () => false;
  assert.ok(protectionReason({ tool_name: 'Edit', tool_input: { file_path: '/r/.eslintrc.json' } }, exists));
  assert.ok(protectionReason({ tool_name: 'MultiEdit', tool_input: { file_path: '/r/ruff.toml' } }, exists));
  assert.ok(protectionReason({ tool_name: 'Write', tool_input: { file_path: '/r/.prettierrc' } }, exists));
  assert.equal(protectionReason({ tool_name: 'Write', tool_input: { file_path: '/r/.prettierrc' } }, missing), null);
  assert.equal(protectionReason({ tool_name: 'Edit', tool_input: { file_path: '/r/src/app.ts' } }, exists), null);
  assert.equal(protectionReason({ tool_name: 'Read', tool_input: { file_path: '/r/.eslintrc.json' } }, exists), null);
});

test('the script blocks an existing config edit with exit 2 and honours the off switch', () => {
  const script = fileURLToPath(new URL('./config-protection.mjs', import.meta.url));
  const directory = mkdtempSync(join(tmpdir(), 'capsule-hook-'));
  const config = join(directory, '.eslintrc.json');
  writeFileSync(config, '{}');
  const run = (file_path, env = {}) => spawnSync(process.execPath, [script], {
    input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path } }),
    encoding: 'utf8', env: { ...process.env, CAPSULE_HOOKS_DISABLED: '', ...env },
  });
  const block = run(config);
  assert.equal(block.status, 2);
  assert.match(block.stderr, /\.eslintrc\.json/);
  assert.equal(run(join(directory, 'new', '.prettierrc')).status, 0);
  assert.equal(run(config, { CAPSULE_HOOKS_DISABLED: 'config-protection' }).status, 0);
});

test('malformed input never blocks or crashes', () => {
  const script = fileURLToPath(new URL('./config-protection.mjs', import.meta.url));
  for (const input of ['', 'not json', 'null', '{}', '{"tool_name":"Edit"}', '{"tool_name":"Edit","tool_input":null}',
    '{"tool_name":"Edit","tool_input":{"file_path":5}}', '{"tool_name":"Write","tool_input":{"file_path":["a"]}}']) {
    assert.equal(spawnSync(process.execPath, [script], { input, encoding: 'utf8' }).status, 0, input);
  }
  assert.equal(protectionReason({ tool_name: 'Edit', tool_input: { file_path: 5 } }, () => true), null);
});
