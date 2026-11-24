import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / (values.length || 1);
const fixed = (value) => (Number.isFinite(value) ? value.toFixed(2) : 'n/a');
const signed = (value) => (Number.isFinite(value) ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}` : 'n/a');
const skillOf = (caseName) => caseName.replace(/-\d+$/, '');

// Turns the JSON that `claude plugin eval --json` writes into a Markdown summary: one row per skill, then
// the expectations that failed with the plugin loaded.
export function summarizeEvals(result) {
  const bySkill = new Map();
  const failures = [];
  for (const item of result.cases ?? []) {
    const skill = skillOf(item.name);
    const entry = bySkill.get(skill) ?? { with: [], without: [], fired: 0, runs: 0 };
    entry.with.push(item.aggregates?.score);
    entry.without.push(item.aggregates?.scoreWithout);
    const runs = item.arms?.with ?? [];
    entry.runs += runs.length;
    entry.fired += runs.filter((run) => run.graders?.find((grader) => grader.name === 'skill-fired')?.passed).length;
    bySkill.set(skill, entry);
    const failed = new Map();
    for (const run of runs) for (const grader of run.graders ?? []) if (grader.scored && !grader.passed) failed.set(grader.name, (failed.get(grader.name) ?? 0) + 1);
    if (failed.size) failures.push(`- ${item.name}: ${[...failed].map(([name, count]) => `${name} (${count} of ${runs.length} runs)`).join(', ')}`);
  }

  const minutes = Math.floor((result.durationSeconds ?? 0) / 60);
  const seconds = String(Math.round((result.durationSeconds ?? 0) % 60)).padStart(2, '0');
  const lines = [
    '## Skill evals',
    '',
    `${result.cases?.length ?? 0} cases, $${(result.costUsd ?? 0).toFixed(2)}, ${minutes}m${seconds}s. Scores are the share of expectations met; "without" runs the same prompt with no plugin loaded.`,
  ];
  if (result.partial) lines.push('', '**The run stopped early** (cost ceiling or credential), so these results are partial.');
  lines.push('', '| Skill | With plugin | Without | Gain | Skill fired |', '| --- | --- | --- | --- | --- |');
  for (const [skill, entry] of [...bySkill].sort(([a], [b]) => a.localeCompare(b))) {
    const withScore = mean(entry.with);
    const withoutScore = mean(entry.without);
    lines.push(`| \`${skill}\` | ${fixed(withScore)} | ${fixed(withoutScore)} | ${signed(withScore - withoutScore)} | ${entry.fired} of ${entry.runs} runs |`);
  }
  if (failures.length) lines.push('', '### Expectations missed with the plugin', '', ...failures);
  return `${lines.join('\n')}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(summarizeEvals(JSON.parse(readFileSync(process.argv[2], 'utf8'))));
}
