#!/usr/bin/env node
// One byte contract for every ADLC stage; no writes or approval decisions.
import { readFileSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export function reviewedContent(input) {
  const text = input.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (text.includes('\r')) throw new Error('Use LF or CRLF line endings, not bare CR.');
  const lines = text.split('\n');
  const frontmatterEnd = lines.indexOf('---', 1);
  if (lines[0] !== '---' || frontmatterEnd < 0) {
    throw new Error('Expected YAML frontmatter delimited by --- on its own lines.');
  }
  const statusLines = lines.slice(1, frontmatterEnd)
    .map((line, index) => /^status:/.test(line) ? index + 1 : -1)
    .filter((index) => index !== -1);
  if (statusLines.length !== 1) throw new Error('Expected exactly one top-level status field.');

  let fence;
  let approvals = -1;
  for (let i = frontmatterEnd + 1; i < lines.length; i++) {
    const marker = lines[i].match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined;
      continue;
    }
    if (marker) { fence = marker[1]; continue; }
    if (/^## Approvals[ \t]*$/.test(lines[i])) { approvals = i; break; }
  }
  if (fence) throw new Error('Unclosed fenced block; cannot identify the approval boundary.');
  if (approvals !== -1) {
    // Never silently hide a requirements section appended after the ledger.
    const ledger = lines.slice(approvals + 1).filter((line) => line.trim());
    const header = '| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |';
    if (ledger.length && (ledger.length < 2 || ledger[0].trim() !== header ||
        !/^\|(?:\s*:?-{3,}:?\s*\|){6}$/.test(ledger[1].trim()) ||
        ledger.slice(2).some((line) => !/^\|.*\|$/.test(line.trim())))) {
      throw new Error('Approvals must be the final section and contain only the six-column decision table. Move substantive content before it.');
    }
  }
  const content = approvals === -1 ? lines : lines.slice(0, approvals);
  content.splice(statusLines[0], 1);
  return content.join('\n') + (approvals === -1 ? '' : '\n');
}

export function contentHash(input, cwd = process.cwd()) {
  const result = spawnSync('git', ['hash-object', '--stdin'], {
    cwd, input: reviewedContent(input), encoding: 'utf8', windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'git hash-object failed.');
  return result.stdout.trim();
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try {
    if (process.argv.length !== 3) throw new Error('Usage: node content-hash.mjs <artifact.md> (run in the target Git repository)');
    const input = readFileSync(process.argv[2], 'utf8');
    process.stdout.write(`${contentHash(input)}\n`);
  } catch (error) {
    console.error(`ADLC content hash: ${error.message}`);
    process.exitCode = 1;
  }
}
