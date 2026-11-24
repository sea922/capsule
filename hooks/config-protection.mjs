import { existsSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook } from './hook-input.mjs';

// Mixed-purpose files (package.json, pyproject.toml, tsconfig.json) are left out: most edits to them are legitimate.
const EXACT = new Set(['.flake8', '.pylintrc', 'pylintrc', '.editorconfig', 'ruff.toml', '.ruff.toml', '.rubocop.yml',
  '.swiftlint.yml', '.golangci.yml', '.golangci.yaml', '.golangci.toml', '.golangci.json', '.eslintignore',
  '.prettierignore', '.stylelintignore', '.markdownlintignore', 'biome.json', 'biome.jsonc', '.biome.json', '.biome.jsonc']);
const PATTERNS = [
  /^\.eslintrc(\.(js|cjs|mjs|json|ya?ml))?$/, /^eslint\.config\.(js|cjs|mjs|ts|cts|mts)$/,
  /^\.prettierrc(\.(js|cjs|mjs|json|json5|ya?ml|toml))?$/, /^prettier\.config\.(js|cjs|mjs|ts|cts|mts)$/,
  /^\.stylelintrc(\.(js|cjs|mjs|json|ya?ml))?$/, /^stylelint\.config\.(js|cjs|mjs|ts|cts|mts)$/,
  /^\.markdownlint(-cli2)?(\.(js|cjs|mjs|json|jsonc|ya?ml))?$/, /^\.markdownlintrc$/,
];
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit']);

export function isProtectedConfig(filePath) {
  const name = basename(filePath);
  return EXACT.has(name) || PATTERNS.some((pattern) => pattern.test(name));
}

export function protectionReason(input, exists = existsSync) {
  const filePath = input.tool_input?.file_path;
  if (!EDIT_TOOLS.has(input.tool_name) || typeof filePath !== 'string' || !filePath || !isProtectedConfig(filePath) || !exists(filePath)) return null;
  return `Blocked: ${basename(filePath)} configures linting or formatting. Fix the code the check reports instead of `
    + 'loosening the check. If the config itself must change, ask the user first.';
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runHook('config-protection', (input) => protectionReason(input));
}
