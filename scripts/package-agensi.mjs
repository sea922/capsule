import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';
import { writeZip } from './zip-archive.mjs';

const EXCLUDED_DIRS = new Set(['evals', '__pycache__', 'node_modules']);
const isExcludedFile = (name) => name === '.DS_Store' || /(^test_.*\.py$)|(\.test\.[cm]?[jt]s$)/.test(name);
const CROSS_SKILL_LINK = /\]\(\.\.\/([a-z0-9-]+)\/([^)#\s]+)(#[^)\s]*)?\)/g;
const VENDORED_SUBDIRS = ['references', 'scripts', 'assets'];
const SCRIPT_EXTENSIONS = /\.(mjs|cjs|js|ts|py|sh)$/;

// Agensi rejects undisclosed network calls; every bundled script must be listed here.
export const SCRIPT_DISCLOSURES = Object.freeze({
  'babysit-pr/scripts/watch_pr.py': 'Runs the GitHub CLI (`gh`) or GitLab CLI (`glab api`) with your existing login to read PR/MR state, checks, and review threads (read-only). Network: your GitHub or GitLab host only. Writes a local JSON run record you choose.',
  'git-workflow/scripts/git-kit.mjs': 'Runs local `git` read commands to report repository state and writes commit-message templates. No network access.',
  'adlc-gate/scripts/content-hash.mjs': 'Runs local `git hash-object --stdin` to hash an artifact. No network access; reads only the file you pass.',
  'orchestrate/scripts/install-agents.mjs': 'Copies bundled agent definitions into `.claude/agents` or `.codex/agents` of a project you name, only with `--apply` (dry run by default). No network access.',
  'html-writeup/scripts/check_html.py': 'Parses a local HTML file and reports external URLs it references. No network access.',
  'writing-for-humans/scripts/check_preservation.py': 'Compares two local text files to check that facts were preserved. No network access.',
});

function walkFiles(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isSymbolicLink()) return [];
    const child = join(path, entry.name);
    if (entry.isDirectory()) return EXCLUDED_DIRS.has(entry.name) ? [] : walkFiles(child);
    return isExcludedFile(entry.name) ? [] : [child];
  });
}

export function findSkillDirs(root) {
  const found = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || EXCLUDED_DIRS.has(entry.name)) continue;
      const child = join(dir, entry.name);
      if (existsSync(join(child, 'SKILL.md'))) found.push(child);
      else visit(child);
    }
  };
  visit(join(root, 'skills'));
  return found.sort();
}

export function readFrontmatter(skillFile) {
  const match = readFileSync(skillFile, 'utf8').replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) throw new Error(`${skillFile}: missing frontmatter`);
  const frontmatter = yaml.load(match[1]);
  for (const field of ['name', 'description']) {
    if (typeof frontmatter?.[field] !== 'string' || !frontmatter[field].trim()) {
      throw new Error(`${skillFile}: frontmatter needs a non-empty ${field}`);
    }
  }
  if (frontmatter.name !== basename(dirname(skillFile))) {
    throw new Error(`${skillFile}: name "${frontmatter.name}" differs from its directory`);
  }
  return frontmatter;
}

function copySkillFiles(sourceDir, targetDir) {
  for (const file of walkFiles(sourceDir)) {
    const target = join(targetDir, relative(sourceDir, file));
    mkdirSync(dirname(target), { recursive: true });
    cpSync(file, target);
  }
}

// A sold zip stands alone, so links into a sibling skill are vendored and rewritten.
function vendorSiblingSkills(skillDir, stageDir) {
  const siblings = new Set();
  for (const file of walkFiles(stageDir).filter((path) => path.endsWith('.md'))) {
    const text = readFileSync(file, 'utf8');
    const rewritten = text.replace(CROSS_SKILL_LINK, (whole, sibling, path, anchor = '') => {
      if (!existsSync(join(dirname(skillDir), sibling, 'SKILL.md'))) return whole;
      siblings.add(sibling);
      const target = join(stageDir, 'vendor', sibling, path);
      const link = relative(dirname(file), target).split(sep).join('/');
      return whole.replace(`../${sibling}/${path}${anchor}`, `${link}${anchor}`);
    });
    if (rewritten !== text) writeFileSync(file, rewritten);
  }
  for (const sibling of siblings) {
    for (const subdir of VENDORED_SUBDIRS) {
      const source = join(dirname(skillDir), sibling, subdir);
      if (existsSync(source)) copySkillFiles(source, join(stageDir, 'vendor', sibling, subdir));
    }
  }
  return [...siblings];
}

function discloseScripts(stageDir, name) {
  const scripts = walkFiles(stageDir)
    .map((file) => relative(stageDir, file).split(sep).join('/'))
    .filter((path) => SCRIPT_EXTENSIONS.test(path));
  return scripts.map((path) => {
    const owner = path.startsWith('vendor/') ? path.split('/')[1] : name;
    const key = `${owner}/${path.replace(/^vendor\/[^/]+\//, '')}`;
    const disclosure = SCRIPT_DISCLOSURES[key];
    if (!disclosure) throw new Error(`${key}: bundled script has no entry in SCRIPT_DISCLOSURES`);
    return { path, disclosure };
  });
}

// Repo-internal sections and links mean nothing to a buyer reading the listing.
const INTERNAL_SECTION = /attribution|basis|evaluation|design and evidence|resources|references|what v\d+ adds/i;
const PROVENANCE_PARAGRAPH = /source sweep|research (report|record)|preferred source|upstream (skill|workflow|prose)|vendored|MIT-licensed|superpowers|pstack|gstack|mattpocock|trail of bits|compound engineering|\bECC\b|evaluation record|evals?[/.]|^see the |research for sources/i;

const isHeading = (paragraph) => paragraph?.startsWith('## ');

export function toListingBody(docsPage) {
  const sections = docsPage.replace(/^# .*\r?\n+/, '').split(/^(?=## )/m);
  const paragraphs = sections
    .filter((section) => !INTERNAL_SECTION.test(section.match(/^## (.*)/)?.[1] ?? ''))
    .join('')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !PROVENANCE_PARAGRAPH.test(paragraph));
  return paragraphs
    .filter((paragraph, index) => !isHeading(paragraph) || (index + 1 < paragraphs.length && !isHeading(paragraphs[index + 1])))
    .join('\n\n')
    .replace(/^## /gm, '### ')
    .replace(/\s*See (the )?[^.]*\]\((?!https?:)[^)]*\)[^.]*\./g, '')
    .replace(/\[([^\]]+)\]\((?!https?:)[^)]*\)/g, '$1');
}

function findDocsPage(root, name) {
  const docsDir = join(root, 'docs');
  if (!existsSync(docsDir)) return null;
  const page = walkFiles(docsDir).find((file) =>
    basename(file) === `${name}.md` && !relative(docsDir, file).startsWith(`research${sep}`));
  return page ? toListingBody(readFileSync(page, 'utf8')) : null;
}

export function findCompanions(stageDir, name, skillNames) {
  const text = readFileSync(join(stageDir, 'SKILL.md'), 'utf8');
  return skillNames.filter((other) => other !== name && text.includes(`\`${other}\``));
}

export function renderListing({ name, frontmatter, docsPage, scripts, vendored, companions = [] }) {
  const invocation = frontmatter['disable-model-invocation']
    ? `User-invoked only: run it as \`/${name}\`.`
    : 'Loads automatically when a request matches its description; can also be invoked by name.';
  const scriptLines = scripts.length
    ? scripts.map(({ path, disclosure }) => `- \`${path}\` — ${disclosure}`).join('\n')
    : '- None. Instructions and reference documents only; no code runs and no network access.';
  const vendoredLine = vendored.length
    ? `\nBundles the shared contracts it depends on from: ${vendored.join(', ')} (under \`vendor/\`).\n`
    : '';
  const companionLine = companions.length
    ? `\nPart of a library; works alongside these companion skills (sold separately), which it names when handing off: ${companions.map((other) => `\`${other}\``).join(', ')}.\n`
    : '';
  return `# ${name}

## Short description

${frontmatter.description}

## Long description

${docsPage ?? frontmatter.description}

## How it runs

${invocation}
Works with agents that load SKILL.md skills (Claude Code, Codex, and compatible harnesses).
${vendoredLine}${companionLine}
## Bundled scripts and external access

${scriptLines}

## License

MIT — LICENSE is included in the zip.
`;
}

export function packageSkill(skillDir, { root, stageRoot, outDir, licenseFile, skillNames = [] }) {
  const frontmatter = readFrontmatter(join(skillDir, 'SKILL.md'));
  const { name } = frontmatter;
  const stageDir = join(stageRoot, name);
  rmSync(stageDir, { recursive: true, force: true });
  copySkillFiles(skillDir, stageDir);
  const vendored = vendorSiblingSkills(skillDir, stageDir);
  const scripts = discloseScripts(stageDir, name);
  if (licenseFile && existsSync(licenseFile)) cpSync(licenseFile, join(stageDir, 'LICENSE'));
  const zipPath = join(outDir, `${name}.zip`);
  writeZip(zipPath, walkFiles(stageDir).map((path) => ({ name: relative(stageDir, path).split(sep).join('/'), path })));
  const listingPath = join(outDir, 'listings', `${name}.md`);
  mkdirSync(dirname(listingPath), { recursive: true });
  writeFileSync(listingPath, renderListing({
    name, frontmatter, docsPage: findDocsPage(root, name), scripts, vendored,
    companions: findCompanions(stageDir, name, skillNames),
  }));
  return { name, zipPath, listingPath, vendored };
}

export function packageAll(root, outDir = join(root, 'dist', 'agensi')) {
  const stageRoot = join(outDir, '.stage');
  mkdirSync(stageRoot, { recursive: true });
  const skillDirs = findSkillDirs(root);
  const skillNames = skillDirs.map((skillDir) => basename(skillDir));
  const results = skillDirs.map((skillDir) =>
    packageSkill(skillDir, { root, stageRoot, outDir, licenseFile: join(root, 'LICENSE'), skillNames }));
  rmSync(stageRoot, { recursive: true, force: true });
  return results;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  for (const { name, zipPath, vendored } of packageAll(root)) {
    const suffix = vendored.length ? `  (vendored: ${vendored.join(', ')})` : '';
    console.log(`${name}\t${relative(root, zipPath)}${suffix}`);
  }
}
