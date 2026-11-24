import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAudit } from './audit.mjs';

const advisory = (id, severity = 'high') => ({ source: 1, title: `issue ${id}`, url: `https://github.com/advisories/${id}`, severity });
const report = (vulnerabilities) => ({ vulnerabilities });
const picomatch = report({
  picomatch: { severity: 'high', via: [advisory('GHSA-fc5q-39xc-vjpf')] },
  tinyglobby: { severity: 'high', via: ['picomatch'] },
});
const exception = { id: 'GHSA-fc5q-39xc-vjpf', package: 'picomatch', reason: 'dev tooling only', expires: '2026-12-31' };
const today = '2026-11-17';

test('an unexcepted high advisory fails, and dependents are not counted twice', () => {
  const result = evaluateAudit(picomatch, [], { today });
  assert.equal(result.ok, false);
  assert.deepEqual(result.failures.map((f) => [f.id, f.package]), [['GHSA-FC5Q-39XC-VJPF', 'picomatch']]);
});

test('a current exception clears exactly its advisory and package', () => {
  const result = evaluateAudit(picomatch, [exception], { today });
  assert.equal(result.ok, true);
  assert.equal(result.excepted.length, 1);
  assert.deepEqual(result.unused, []);
});

test('an exception does not cover another advisory or the same advisory in another package', () => {
  const other = report({
    picomatch: { severity: 'high', via: [advisory('GHSA-fc5q-39xc-vjpf'), advisory('GHSA-aaaa-bbbb-cccc')] },
    micromatch: { severity: 'high', via: [advisory('GHSA-fc5q-39xc-vjpf')] },
  });
  const result = evaluateAudit(other, [exception], { today });
  assert.equal(result.ok, false);
  assert.deepEqual(result.failures.map((f) => [f.id, f.package]), [['GHSA-AAAA-BBBB-CCCC', 'picomatch'], ['GHSA-FC5Q-39XC-VJPF', 'micromatch']]);
});

test('an expired exception fails so it is reviewed again', () => {
  const result = evaluateAudit(picomatch, [exception], { today: '2027-01-01' });
  assert.equal(result.ok, false);
  assert.equal(result.expired.length, 1);
});

test('findings below the level pass and leave the exception unused', () => {
  const low = report({ picomatch: { severity: 'moderate', via: [advisory('GHSA-fc5q-39xc-vjpf', 'moderate')] } });
  const result = evaluateAudit(low, [exception], { today });
  assert.equal(result.ok, true);
  assert.deepEqual(result.unused, [exception]);
});

test('a clean report passes', () => {
  assert.equal(evaluateAudit(report({}), [], { today }).ok, true);
});
