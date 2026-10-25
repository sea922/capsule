import assert from 'node:assert/strict';
import test from 'node:test';
import { loadReport } from './report.mjs';

test('authorization rejects asynchronously and performs no read or audit', async () => {
  const events = [];
  let pending;
  assert.doesNotThrow(() => {
    pending = loadReport('r1', {
      canRead: () => false,
      read: () => events.push('read'),
      audit: () => events.push('audit'),
    });
  });
  assert.ok(pending instanceof Promise);
  await assert.rejects(pending, { message: 'Forbidden' });
  assert.deepEqual(events, []);
});

for (const label of [undefined, null, '', 0, false, 'Ready']) {
  test(`preserves result shape and label ${String(label)}`, async () => {
    const result = await loadReport('r1', {
      canRead: () => true,
      read: async () => ({ count: 0, label }),
      audit: () => {},
    });
    assert.deepEqual(result, { id: 'r1', count: 0, label: label ?? '' });
  });
}

test('null report remains null', async () => {
  assert.equal(await loadReport('r1', {
    canRead: () => true, read: async () => null, audit: () => {},
  }), null);
});

test('preserves observable label getter evaluations', async () => {
  for (const [label, expectedReads] of [[null, 1], [undefined, 2], ['Ready', 3]]) {
    let reads = 0;
    const result = await loadReport('r1', {
      canRead: () => true,
      read: async () => ({ count: 1, get label() { reads++; return label; } }),
      audit: () => {},
    });
    assert.deepEqual(result, { id: 'r1', count: 1, label: label ?? '' });
    assert.equal(reads, expectedReads);
  }
});

for (const fails of [false, true]) {
  test(`audit follows deferred read settlement (failure=${fails})`, async () => {
    const events = [];
    let settle;
    const read = new Promise((resolve, reject) => {
      settle = () => {
        events.push('settled');
        if (fails) reject(new Error('Storage unavailable'));
        else resolve({ count: 2, label: 'Ready' });
      };
    });
    const pending = loadReport('r1', {
      canRead: () => true,
      read: () => { events.push('read'); return read; },
      audit: (event) => events.push(event),
    });
    assert.deepEqual(events, ['read']);
    settle();
    if (fails) await assert.rejects(pending, { message: 'Storage unavailable' });
    else assert.deepEqual(await pending, { id: 'r1', count: 2, label: 'Ready' });
    assert.deepEqual(events, ['read', 'settled', 'read-finished']);
  });
}
