import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = join(dirname(fileURLToPath(import.meta.url)), 'statusline.mjs');

// Copies the status line script into <target>/.claude/ and points <target>/.claude/settings.local.json at it.
// A plugin cannot register a status line, and its install path changes with each version, so the script is
// copied to a stable place. An existing status line is never replaced: remove it first to switch.
export function installStatusline({ target, apply = false }) {
  const root = resolve(target ?? '');
  if (!target || !existsSync(root) || !statSync(root).isDirectory()) throw new Error(`target is not an existing directory: ${target}`);
  const script = join(root, '.claude', 'capsule-statusline.mjs');
  const settingsPath = join(root, '.claude', 'settings.local.json');
  const statusLine = { type: 'command', command: `node "${script}"` };

  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch {
      throw new Error(`${settingsPath} is not valid JSON; fix it and run again`);
    }
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error(`${settingsPath} is not valid JSON; fix it and run again`);
  }
  const current = settings.statusLine;
  const ours = current?.type === statusLine.type && current?.command === statusLine.command;
  if (current && !ours) throw new Error(`${settingsPath} already has a status line; remove its statusLine entry to use capsule's`);

  const content = readFileSync(SOURCE, 'utf8');
  const scriptCurrent = existsSync(script) && readFileSync(script, 'utf8') === content;
  const changed = !ours || !scriptCurrent;
  if (!apply) return { dryRun: true, script, settings: settingsPath, changed };
  if (changed) {
    mkdirSync(dirname(script), { recursive: true });
    writeFileSync(script, content);
    writeFileSync(settingsPath, `${JSON.stringify({ ...settings, statusLine }, null, 2)}\n`);
  }
  return { dryRun: false, script, settings: settingsPath, changed };
}

function parseArguments(argv) {
  const options = { apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--apply') options.apply = true;
    else if (argv[index] === '--target') options.target = argv[index += 1];
    else throw new Error(`unknown argument: ${argv[index]}`);
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = installStatusline(parseArguments(process.argv.slice(2)));
    const verb = result.dryRun ? (result.changed ? 'Would write' : 'Already installed:') : (result.changed ? 'Wrote' : 'Already installed:');
    console.log(`${verb}\n  ${result.script}\n  ${result.settings}`);
    if (result.dryRun && result.changed) console.log('Dry run. Add --apply to write.');
  } catch (error) {
    console.error(error.message);
    console.error('Usage: node statusline/install.mjs --target <project> [--apply]');
    process.exit(1);
  }
}
