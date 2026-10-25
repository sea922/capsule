import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yaml from 'js-yaml';

function walk(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isSymbolicLink()) return [];
    const child = join(path, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

export function validateRepository(root) {
  root = realpathSync(root);
  const errors = [];
  const fail = (file, message) => errors.push(`${relative(root, file)}: ${message}`);
  const read = (file) => {
    try { return readFileSync(file, 'utf8').replace(/^\uFEFF/, ''); }
    catch (error) { fail(file, error.message); return ''; }
  };
  const json = (file) => {
    try { return JSON.parse(read(file)); }
    catch (error) { fail(file, `invalid JSON: ${error.message}`); return {}; }
  };
  const inside = (file) => {
    const rel = relative(root, existsSync(file) ? realpathSync(file) : resolve(file));
    return rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
  };
  const pkg = json(join(root, 'package.json'));
  if (typeof pkg.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version)) fail(join(root, 'package.json'), 'invalid release version');
  const manifestPath = join(root, '.claude-plugin/plugin.json');
  const manifest = json(manifestPath);
  const lock = json(join(root, 'package-lock.json'));
  if (manifest.name !== pkg.name) fail(manifestPath, 'name differs from package.json');
  for (const [label, version] of [['plugin', manifest.version], ['lock', lock.version], ['lock root', lock.packages?.['']?.version]]) {
    if (version !== pkg.version) fail(manifestPath, `${label} version differs from package.json`);
  }
  const marketplace = json(join(root, '.claude-plugin/marketplace.json'));
  if (!marketplace.plugins?.some((p) => p.name === manifest.name && p.source === './')) {
    fail(manifestPath, 'marketplace must reference the local plugin');
  }
  const listed = new Set();
  if (!Array.isArray(manifest.skills) || !manifest.skills.length) fail(manifestPath, 'skills must be a nonempty array');
  for (const path of Array.isArray(manifest.skills) ? manifest.skills : []) {
    if (typeof path !== 'string' || !path.startsWith('./skills/') || path.split('/').includes('..')) {
      fail(manifestPath, `invalid skill path: ${path}`); continue;
    }
    const file = resolve(root, path, 'SKILL.md');
    if (listed.has(file)) fail(manifestPath, `duplicate skill path: ${path}`);
    listed.add(file);
    if (!inside(file) || !existsSync(file)) fail(manifestPath, `missing or escaping skill path: ${path}`);
  }
  const skills = walk(join(root, 'skills')).filter((f) => basename(f) === 'SKILL.md');
  if (!skills.length) fail(manifestPath, 'no skills found');
  const topReadme = read(join(root, 'README.md'));
  const hasEntry = (text, name) => text.includes(`[${name}]`) || text.includes('[`' + name + '`]');
  const docs = walk(join(root, 'docs')).filter((f) => f.endsWith('.md') && !relative(join(root, 'docs'), f).startsWith(`research${sep}`));
  const names = new Set();
  for (const file of skills) {
    const folder = dirname(file);
    const name = basename(folder);
    if (!listed.has(file)) fail(file, 'skill absent from plugin manifest');
    if (names.has(name)) fail(file, `duplicate skill name: ${name}`);
    names.add(name);
    const text = read(file);
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    let meta = {};
    if (!frontmatter) fail(file, 'missing YAML frontmatter');
    else {
      try { meta = yaml.load(frontmatter[1]) ?? {}; }
      catch (error) { fail(file, `invalid YAML: ${error.message}`); }
    }
    if (meta.name !== name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name) || name.length > 64) fail(file, 'name must match directory and skill naming rules');
    if (typeof meta.description !== 'string' || !meta.description.trim() || meta.description.length > 1024) fail(file, 'description must contain 1-1024 characters');
    if (!hasEntry(topReadme, name)) fail(file, 'missing top-level README entry');
    const parent = dirname(folder);
    if (parent !== join(root, 'skills') && !hasEntry(read(join(parent, 'README.md')), name)) fail(file, 'missing bucket README entry');
    if (!docs.some((doc) => basename(doc) === `${name}.md`)) fail(file, 'missing human-facing docs page');
    const evalPath = join(folder, 'evals/evals.json');
    if (existsSync(evalPath)) {
      const data = json(evalPath);
      if (data.skill_name !== name) fail(evalPath, 'skill_name differs from directory');
      if (!Array.isArray(data.evals) || !data.evals.length) fail(evalPath, 'evals must be a nonempty array');
      const ids = new Set();
      for (const item of Array.isArray(data.evals) ? data.evals : []) {
        if (!Number.isInteger(item.id) || ids.has(item.id)) fail(evalPath, 'eval ids must be unique integers');
        ids.add(item.id);
        for (const field of ['prompt', 'expected_output']) if (typeof item[field] !== 'string' || !item[field].trim()) fail(evalPath, `missing ${field}`);
        if (!Array.isArray(item.files)) fail(evalPath, 'files must be an array');
        for (const path of Array.isArray(item.files) ? item.files : []) {
          if (typeof path !== 'string') { fail(evalPath, 'fixture path must be a string'); continue; }
          const target = resolve(folder, path);
          if (!inside(target) || !existsSync(target)) fail(evalPath, `missing or escaping fixture: ${path}`);
        }
      }
    }
  }
  // Inline Markdown links in maintained docs. Research captures and code examples
  // can intentionally quote obsolete paths; remote URLs/anchors are not fetched.
  const markdown = [...walk(join(root, 'skills')), ...docs, ...readdirSync(root).filter((f) => f.endsWith('.md')).map((f) => join(root, f))].filter((f) => f.endsWith('.md'));
  for (const file of markdown) {
    const prose = read(file).replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '').replace(/`[^`\n]+`/g, '');
    for (const match of prose.matchAll(/\[[^\]\n]*\]\((<[^>]+>|[^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      const link = match[1].replace(/^<|>$/g, '');
      if (/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(link)) continue;
      let path;
      try { path = decodeURIComponent(link.split(/[?#]/)[0]); }
      catch { fail(file, `invalid link encoding: ${link}`); continue; }
      if (!path) continue;
      const target = path.startsWith('/') ? resolve(root, `.${path}`) : resolve(dirname(file), path);
      if (!inside(target) || !existsSync(target)) fail(file, `broken local link: ${link}`);
    }
  }
  for (const file of walk(join(root, '.github')).filter((f) => /\.ya?ml$/.test(f))) {
    try {
      const data = yaml.load(read(file));
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('expected a YAML mapping');
      if (dirname(file) === join(root, '.github/workflows')) {
        if (!data.permissions) fail(file, 'workflow must declare default permissions');
        for (const job of Object.values(data.jobs ?? {})) {
          if (!job['timeout-minutes']) fail(file, 'job must declare timeout-minutes');
          const references = [job.uses, ...(job.steps ?? []).map((step) => step.uses)].filter(Boolean);
          for (const action of references) {
            if (!action.startsWith('./') && !/^[^@]+@[a-f0-9]{40}$/.test(action)) fail(file, `action must be pinned to a commit SHA: ${action}`);
          }
        }
      }
    } catch (error) { fail(file, `invalid YAML: ${error.message}`); }
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const errors = validateRepository(root);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
  } else console.log('Repository validation passed: skill metadata, publication entries, evals, local links, and versions.');
}
