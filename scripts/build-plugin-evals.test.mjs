import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import * as yaml from 'js-yaml';
import { buildPluginEvals } from './build-plugin-evals.mjs';

const frontmatter = (text) => yaml.load(text.match(/^---\n([\s\S]*?)\n---/)[1]);
const body = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();

test('each skill eval becomes a case with a skill-fired indicator and one judged grader per expectation', (t) => {
  const out = mkdtempSync(join(tmpdir(), 'capsule-evals-'));
  t.after(() => rmSync(out, { recursive: true, force: true }));
  const result = buildPluginEvals({ skills: ['api-design'], outDir: out });
  const source = JSON.parse(readFileSync('skills/engineering/api-design/evals/evals.json', 'utf8'));
  assert.equal(result.cases.length, source.evals.length);

  const first = join(out, 'api-design-1');
  const prompt = readFileSync(join(first, 'prompt.md'), 'utf8');
  assert.equal(body(prompt), source.evals[0].prompt);
  assert.deepEqual(frontmatter(prompt).tags, ['api-design']);
  assert.ok(frontmatter(prompt).allowed_tools.includes('Skill'));

  const fired = readFileSync(join(first, 'graders', 'skill-fired.md'), 'utf8');
  assert.equal(frontmatter(fired).type, 'tool_used');
  assert.equal(frontmatter(fired).tool, 'Skill');
  assert.ok(new RegExp(frontmatter(fired).input_match).test('{"skill": "capsule:api-design"}'));
  assert.ok(!new RegExp(frontmatter(fired).input_match).test('{"skill": "capsule:api-design-extra"}'));

  const judged = readdirSync(join(first, 'graders')).filter((name) => name.startsWith('expectation-'));
  assert.equal(judged.length, source.evals[0].expectations.length);
  const grader = readFileSync(join(first, 'graders', judged[0]), 'utf8');
  assert.equal(frontmatter(grader).type, 'llm');
  assert.ok(body(grader).includes(source.evals[0].expectations[0]));
});

test('an unknown skill is refused', () => {
  assert.throws(() => buildPluginEvals({ skills: ['no-such-skill'], outDir: tmpdir() }), /no evals for skill: no-such-skill/);
});
