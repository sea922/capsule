import assert from 'node:assert/strict';
import { test } from 'node:test';
import { badge, compact, mergeTraffic, total } from './traffic.mjs';

const day = (date, count, uniques) => ({ timestamp: `${date}T00:00:00Z`, count, uniques });

test('merging keeps days outside the 14-day window and refreshes days inside it', () => {
  const stored = { clones: { '2026-11-01': { count: 4, uniques: 2 }, '2026-11-20': { count: 1, uniques: 1 } } };
  const response = { count: 9, uniques: 5, clones: [day('2026-11-20', 3, 2), day('2026-11-21', 6, 3)] };
  const merged = mergeTraffic(stored, 'clones', response);
  assert.deepEqual(merged.clones, {
    '2026-11-01': { count: 4, uniques: 2 },
    '2026-11-20': { count: 3, uniques: 2 },
    '2026-11-21': { count: 6, uniques: 3 },
  });
  assert.deepEqual(stored.clones['2026-11-20'], { count: 1, uniques: 1 });
});

test('merging into an empty store starts the kind and leaves other kinds alone', () => {
  const merged = mergeTraffic({ clones: { '2026-11-01': { count: 1, uniques: 1 } } }, 'views', { views: [day('2026-11-02', 7, 4)] });
  assert.deepEqual(merged.views, { '2026-11-02': { count: 7, uniques: 4 } });
  assert.deepEqual(merged.clones, { '2026-11-01': { count: 1, uniques: 1 } });
});

test('a response without the expected list is rejected', () => {
  assert.throws(() => mergeTraffic({}, 'clones', { message: 'Must have push access' }), /clones/);
});

test('totals add every stored day', () => {
  const store = { views: { a: { count: 10, uniques: 3 }, b: { count: 5, uniques: 2 } } };
  assert.equal(total(store, 'views'), 15);
  assert.equal(total({}, 'clones'), 0);
});

test('counts are compacted for badges', () => {
  assert.equal(compact(999), '999');
  assert.equal(compact(1000), '1k');
  assert.equal(compact(1250), '1.3k');
  assert.equal(compact(2_500_000), '2.5M');
});

test('badges follow the shields.io endpoint schema', () => {
  assert.deepEqual(badge('clones', 1250, 'blue'), { schemaVersion: 1, label: 'clones', message: '1.3k', color: 'blue' });
});
