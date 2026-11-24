import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RULES_ROOT = dirname(fileURLToPath(import.meta.url));

export function availableSets() {
  return readdirSync(RULES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

// Copies rule sets into <target>/.claude/rules/capsule/. Every file is checked before any is
// written, so a file the project has changed stops the run with nothing half-installed.
export function installRules({ target, sets = ['common'], apply = false }) {
  const root = resolve(target ?? '');
  if (!target || !existsSync(root) || !statSync(root).isDirectory()) throw new Error(`target is not an existing directory: ${target}`);
  const known = availableSets();
  const unknown = sets.filter((set) => !known.includes(set));
  if (unknown.length) throw new Error(`unknown rule set: ${unknown.join(', ')} (available: ${known.join(', ')})`);

  const plan = [...new Set(sets)].flatMap((set) => readdirSync(join(RULES_ROOT, set))
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({
      destination: join(root, '.claude', 'rules', 'capsule', set, name),
      content: readFileSync(join(RULES_ROOT, set, name), 'utf8'),
    })));

  const unchanged = [];
  const pending = [];
  const conflicts = [];
  for (const file of plan) {
    if (!existsSync(file.destination)) pending.push(file);
    else if (readFileSync(file.destination, 'utf8') === file.content) unchanged.push(file.destination);
    else conflicts.push(file.destination);
  }
  if (conflicts.length) throw new Error(`these rules differ from capsule's and were left alone; remove or rename them to reinstall:\n${conflicts.join('\n')}`);

  const paths = pending.map((file) => file.destination);
  if (!apply) return { dryRun: true, planned: plan.length, wouldCreate: paths, unchanged };
  for (const file of pending) {
    mkdirSync(dirname(file.destination), { recursive: true });
    writeFileSync(file.destination, file.content);
  }
  return { dryRun: false, planned: plan.length, created: paths, unchanged };
}

function parseArguments(argv) {
  const options = { sets: ['common'], apply: false };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--apply') options.apply = true;
    else if (argv[index] === '--target') options.target = argv[index += 1];
    else if (argv[index] === '--sets') options.sets = (argv[index += 1] ?? '').split(',').map((set) => set.trim()).filter(Boolean);
    else throw new Error(`unknown argument: ${argv[index]}`);
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = installRules(parseArguments(process.argv.slice(2)));
    const written = result.dryRun ? result.wouldCreate : result.created;
    console.log(result.dryRun ? `Dry run: ${written.length} rule file(s) would be created. Add --apply to write them.` : `Created ${written.length} rule file(s).`);
    for (const path of written) console.log(`  ${path}`);
    if (result.unchanged.length) console.log(`${result.unchanged.length} already up to date.`);
  } catch (error) {
    console.error(`${error.message}\nUsage: node rules/install.mjs --target <project> [--sets ${availableSets().join(',')}] [--apply]`);
    process.exit(1);
  }
}
