#!/usr/bin/env node
// Read-only ADLC approval-chain verifier. No writes or approval decisions.
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contentHash } from './content-hash.mjs';

const STAGES = ['intent', 'spec', 'plan'];
const VALID_DECISIONS = new Set(['approved', 'approved-with-conditions', 'waived']);

function parseFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const end = lines.indexOf('---', 1);
  if (lines[0] !== '---' || end < 0) throw new Error('Missing YAML frontmatter');
  const fields = {};
  for (const line of lines.slice(1, end)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) fields[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return { fields, bodyLines: lines.slice(end + 1) };
}

function splitRow(line) {
  const cells = [];
  let current = '';
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '\\' && line[i + 1] === '|') {
      current += '|';
      i++;
      continue;
    }
    if (line[i] === '|') {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += line[i];
  }
  return cells.slice(1);
}

function parseApprovals(bodyLines) {
  let fence;
  let index = -1;
  for (let i = 0; i < bodyLines.length; i++) {
    const marker = bodyLines[i].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    if (marker) { fence = marker[1]; continue; }
    if (/^## Approvals[ \t]*$/.test(bodyLines[i])) { index = i; break; }
  }
  if (index === -1) return [];
  const ledger = bodyLines.slice(index + 1).filter((l) => l.trim());
  if (ledger.length < 2) return [];
  return ledger.slice(2).map((row) => {
    const [stage, decision, approver, date, revision, conditions] = splitRow(row.trim());
    return { stage, decision, approver, date, revision, conditions };
  });
}

function parseSourceRef(raw) {
  if (!raw) return null;
  const at = raw.lastIndexOf('@');
  if (at <= 0) return { path: raw, hash: null };
  return { path: raw.slice(0, at), hash: raw.slice(at + 1) };
}

export function verifyChain(directory) {
  const dir = resolve(directory);
  const issues = [];
  const stages = {};
  const hashes = {};

  for (const stage of STAGES) {
    const file = join(dir, `${stage}.md`);
    if (!existsSync(file)) {
      stages[stage] = { present: false };
      continue;
    }
    const text = readFileSync(file, 'utf8');
    let parsed;
    let hash;
    try {
      parsed = parseFrontmatter(text);
      hash = contentHash(text, dirname(file));
    } catch (error) {
      stages[stage] = { present: true, valid: false, error: error.message };
      issues.push(`${stage}.md: ${error.message}`);
      continue;
    }
    hashes[stage] = hash;
    const rows = parseApprovals(parsed.bodyLines).filter((r) => r.stage === stage);
    const latest = rows.at(-1) ?? null;
    const status = parsed.fields.status ?? null;
    const source = parseSourceRef(parsed.fields.source);
    const stageIssues = [];

    if (VALID_DECISIONS.has(status)) {
      if (!latest) stageIssues.push(`status is ${status} with no ${stage} row in Approvals`);
      else {
        if (latest.decision !== status) stageIssues.push(`frontmatter status (${status}) differs from latest decision (${latest.decision})`);
        if (latest.revision !== hash) stageIssues.push(`reviewed revision (${latest.revision}) differs from current hash (${hash})`);
      }
    }

    if (stage === 'spec' || stage === 'plan') {
      const upstream = stage === 'spec' ? 'intent' : 'spec';
      if (!source || !source.hash) {
        stageIssues.push(`missing source: <path>@<hash> binding to ${upstream}.md`);
      } else if (!hashes[upstream]) {
        stageIssues.push(`upstream ${upstream}.md missing or invalid`);
      } else {
        const upStage = stages[upstream];
        if (!upStage?.approved) stageIssues.push(`upstream ${upstream}.md is not currently approved`);
        if (source.hash !== hashes[upstream]) stageIssues.push(`source hash (${source.hash}) is stale vs ${upstream}.md (${hashes[upstream]})`);
      }
    }

    const approved = VALID_DECISIONS.has(status) && stageIssues.length === 0;
    stages[stage] = { present: true, status, hash, latestDecision: latest, source, approved, issues: stageIssues };
    for (const msg of stageIssues) issues.push(`${stage}.md: ${msg}`);
  }

  const progressFile = join(dir, 'progress.md');
  let progress = { present: false };
  if (existsSync(progressFile)) {
    try {
      const parsed = parseFrontmatter(readFileSync(progressFile, 'utf8'));
      const planRef = parseSourceRef(parsed.fields.plan);
      const progressIssues = [];
      if (!planRef || !planRef.hash) progressIssues.push('missing plan: <path>@<hash> binding');
      else if (!hashes.plan) progressIssues.push('plan.md missing or invalid');
      else if (planRef.hash !== hashes.plan) progressIssues.push(`plan hash (${planRef.hash}) differs from current plan.md (${hashes.plan})`);
      progress = { present: true, plan: planRef, valid: progressIssues.length === 0, issues: progressIssues };
      for (const msg of progressIssues) issues.push(`progress.md: ${msg}`);
    } catch (error) {
      progress = { present: true, valid: false, error: error.message };
      issues.push(`progress.md: ${error.message}`);
    }
  }

  return { ok: issues.length === 0, directory: dir, stages, progress, issues };
}

function isMain() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  if (process.argv.length !== 3) {
    console.error('Usage: node verify-chain.mjs <adlc-work-item-dir>');
    process.exitCode = 2;
  } else {
    const result = verifyChain(process.argv[2]);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (!result.ok) process.exitCode = 1;
  }
}
