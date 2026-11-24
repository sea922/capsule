import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { contentHash } from './content-hash.mjs';
import { verifyChain } from './verify-chain.mjs';

const TABLE = '\n| Stage | Decision | Approver | Date | Reviewed revision | Conditions / reasons |\n| --- | --- | --- | --- | --- | --- |\n';

function approve(stage, body, decision = 'approved') {
  const hash = contentHash(body);
  return {
    hash,
    text: body.replace('status: draft', `status: ${decision}`) + TABLE +
      `| ${stage} | ${decision} | Jane (owner) | 2026-11-21 | ${hash} | none |\n`,
  };
}

test('verifyChain accepts a complete approved intent -> spec -> plan -> progress chain', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'adlc-chain-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const intent = approve('intent', '---\nadlc: intent\nslug: demo\nstatus: draft\n---\n\n# Intent\n\nShip X.\n\n## Approvals\n');
  writeFileSync(join(dir, 'intent.md'), intent.text);

  const spec = approve('spec', `---\nadlc: spec\nslug: demo\nsource: intent.md@${intent.hash}\nstatus: draft\n---\n\n# Spec\n\nAC-001.\n\n## Approvals\n`);
  writeFileSync(join(dir, 'spec.md'), spec.text);

  const plan = approve('plan', `---\nadlc: plan\nslug: demo\nsource: spec.md@${spec.hash}\nstatus: draft\n---\n\n# Plan\n\nS1.\n\n## Approvals\n`);
  writeFileSync(join(dir, 'plan.md'), plan.text);

  writeFileSync(join(dir, 'progress.md'), `---\nadlc: progress\nslug: demo\nplan: plan.md@${plan.hash}\n---\n\n# Progress\n`);

  const result = verifyChain(dir);
  assert.equal(result.ok, true, result.issues.join('; '));
  assert.equal(result.stages.intent.approved, true);
  assert.equal(result.stages.spec.approved, true);
  assert.equal(result.stages.plan.approved, true);
  assert.equal(result.progress.valid, true);
});

test('verifyChain flags edited approved content and stale downstream source hashes', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'adlc-chain-stale-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const intent = approve('intent', '---\nadlc: intent\nslug: demo\nstatus: draft\n---\n\n# Intent\n\nShip X.\n\n## Approvals\n');
  writeFileSync(join(dir, 'intent.md'), intent.text.replace('Ship X.', 'Ship Y.'));

  const spec = approve('spec', `---\nadlc: spec\nslug: demo\nsource: intent.md@${intent.hash}\nstatus: draft\n---\n\n# Spec\n\nAC-001.\n\n## Approvals\n`);
  writeFileSync(join(dir, 'spec.md'), spec.text);

  const result = verifyChain(dir);
  assert.equal(result.ok, false);
  assert.ok(result.issues.some((m) => m.includes('intent.md') && m.includes('differs from current hash')));
  assert.ok(result.issues.some((m) => m.includes('spec.md') && m.includes('stale')));
});
