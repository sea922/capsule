import assert from 'node:assert/strict';
import { test } from 'node:test';
import { summarizeEvals } from './summarize-evals.mjs';

const run = (score, fired, failed = []) => ({
  score,
  error: null,
  graders: [
    { name: 'skill-fired', passed: fired, scored: false },
    ...['expectation-01', 'expectation-02'].map((name) => ({ name, passed: !failed.includes(name), scored: true })),
  ],
});

const result = {
  durationSeconds: 125,
  costUsd: 1.234,
  partial: false,
  aggregates: { overallScore: 0.6, meanDelta: 0.25 },
  cases: [
    { name: 'api-design-1', arms: { with: [run(1, true), run(0.5, false, ['expectation-02'])], without: [run(0.5, false)] }, aggregates: { score: 0.75, scoreWithout: 0.5, delta: 0.25 } },
    { name: 'api-design-2', arms: { with: [run(0.5, true, ['expectation-01'])], without: [run(0.5, false)] }, aggregates: { score: 0.5, scoreWithout: 0.5, delta: 0 } },
    { name: 'seo-1', arms: { with: [run(1, true)], without: [run(0, false)] }, aggregates: { score: 1, scoreWithout: 0, delta: 1 } },
  ],
};

test('the summary has one row per skill with scores, the gain, and how often the skill fired', () => {
  const text = summarizeEvals(result);
  assert.match(text, /\| Skill \| With plugin \| Without \| Gain \| Skill fired \|/);
  assert.match(text, /\| `api-design` \| 0\.63 \| 0\.50 \| \+0\.13 \| 2 of 3 runs \|/);
  assert.match(text, /\| `seo` \| 1\.00 \| 0\.00 \| \+1\.00 \| 1 of 1 runs \|/);
  assert.match(text, /3 cases, \$1\.23, 2m05s/);
});

test('failing expectations are listed per case, and a partial run says so', () => {
  const text = summarizeEvals({ ...result, partial: true });
  assert.match(text, /api-design-1: expectation-02 \(1 of 2 runs\)/);
  assert.match(text, /api-design-2: expectation-01 \(1 of 1 runs\)/);
  assert.match(text, /stopped early/i);
});
