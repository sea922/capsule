import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 };
const GHSA = /GHSA(?:-[0-9a-z]{4}){3}/i;

// Decide an `npm audit --json` report against reviewed exceptions. Only advisory
// entries are judged; packages that merely depend on a vulnerable package
// clear when the advisory beneath them does. An exception covers one advisory
// in one package until it expires, so a fix landing upstream or a new advisory
// still fails the check.
export function evaluateAudit(report, exceptions, { level = 'high', today = new Date().toISOString().slice(0, 10) } = {}) {
  const threshold = RANK[level];
  if (threshold === undefined) throw new Error(`unknown audit level: ${level}`);
  const failures = [];
  const excepted = [];
  const expired = [];
  const used = new Set();

  for (const [name, vuln] of Object.entries(report.vulnerabilities ?? {})) {
    for (const via of vuln.via ?? []) {
      if (typeof via !== 'object' || (RANK[via.severity] ?? RANK.critical) < threshold) continue;
      const id = (via.url ?? '').match(GHSA)?.[0]?.toUpperCase() ?? via.url ?? String(via.source);
      const finding = { id, package: name, severity: via.severity, title: via.title };
      const exception = exceptions.find((e) => e.id.toUpperCase() === id && e.package === name);
      if (!exception) { failures.push(finding); continue; }
      used.add(exception);
      if (exception.expires < today) expired.push({ ...finding, expires: exception.expires });
      else excepted.push({ ...finding, reason: exception.reason, expires: exception.expires });
    }
  }

  const unused = exceptions.filter((e) => !used.has(e));
  return { ok: failures.length === 0 && expired.length === 0, failures, excepted, expired, unused };
}

export function readExceptions(path) {
  const list = JSON.parse(readFileSync(path, 'utf8'));
  if (!Array.isArray(list)) throw new Error(`${path} must hold an array`);
  for (const e of list) {
    for (const field of ['id', 'package', 'reason', 'expires']) {
      if (typeof e[field] !== 'string' || !e[field].trim()) throw new Error(`${path}: every exception needs ${field}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.expires)) throw new Error(`${path}: expires must be YYYY-MM-DD`);
  }
  return list;
}

function runAudit(root) {
  try {
    return execFileSync('npm', ['audit', '--json'], { cwd: root, encoding: 'utf8', shell: process.platform === 'win32', maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    // npm audit exits non-zero whenever it finds anything; the report is still on stdout.
    if (error.stdout) return error.stdout;
    throw error;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const level = process.argv[2] ?? 'high';
  const result = evaluateAudit(JSON.parse(runAudit(root)), readExceptions(join(root, '.github/audit-exceptions.json')), { level });
  for (const f of result.excepted) console.log(`excepted ${f.id} in ${f.package} until ${f.expires}: ${f.reason}`);
  for (const e of result.unused) console.log(`unused exception ${e.id} in ${e.package}: remove it from .github/audit-exceptions.json`);
  for (const f of result.expired) console.error(`expired exception ${f.id} in ${f.package} (${f.expires}): review it again`);
  for (const f of result.failures) console.error(`${f.severity} ${f.id} in ${f.package}: ${f.title}`);
  if (!result.ok) process.exit(1);
  console.log(`Dependency audit passed at level ${level}.`);
}
