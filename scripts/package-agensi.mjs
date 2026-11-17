import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

const EXCLUDED_DIRS = new Set(['evals', '__pycache__', 'node_modules']);
const isExcludedFile = (name) => name === '.DS_Store' || /(^test_.*\.py$)|(\.test\.[cm]?[jt]s$)/.test(name);
const CROSS_SKILL_LINK = /\]\(\.\.\/([a-z0-9-]+)\/([^)#\s]+)(#[^)\s]*)?\)/g;
const VENDORED_SUBDIRS = ['references', 'scripts', 'assets'];

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

export function packageSkill(skillDir, { stageRoot, outDir, licenseFile }) {
  const { name } = readFrontmatter(join(skillDir, 'SKILL.md'));
  const stageDir = join(stageRoot, name);
  rmSync(stageDir, { recursive: true, force: true });
  copySkillFiles(skillDir, stageDir);
  const vendored = vendorSiblingSkills(skillDir, stageDir);
  if (licenseFile && existsSync(licenseFile)) cpSync(licenseFile, join(stageDir, 'LICENSE'));
  const zipPath = join(outDir, `${name}.zip`);
  rmSync(zipPath, { force: true });
  execFileSync('zip', ['-qrX', zipPath, '.'], { cwd: stageDir });
  return { name, zipPath, vendored };
}

export function packageAll(root, outDir = join(root, 'dist', 'agensi')) {
  const stageRoot = join(outDir, '.stage');
  mkdirSync(stageRoot, { recursive: true });
  const results = findSkillDirs(root).map((skillDir) =>
    packageSkill(skillDir, { stageRoot, outDir, licenseFile: join(root, 'LICENSE') }));
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
