import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Every skill directory that has an evals/evals.json, by skill name.
function skillEvalFiles() {
  const found = new Map();
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === 'node_modules') continue;
      const path = join(directory, entry.name);
      const file = join(path, 'evals', 'evals.json');
      if (existsSync(join(path, 'SKILL.md')) && existsSync(file)) found.set(entry.name, file);
      else walk(path);
    }
  };
  walk(join(ROOT, 'skills'));
  return found;
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const quote = (text) => JSON.stringify(text);

// Converts skills' evals/evals.json into cases for `claude plugin eval`: one folder per eval, the prompt as
// prompt.md, an unscored indicator that the skill fired, and one judged grader per expectation. The skills'
// evals.json files stay the source of truth; the generated suite is disposable.
export function buildPluginEvals({ skills, outDir, maxTurns = 20 }) {
  const files = skillEvalFiles();
  const wanted = skills?.length ? skills : [...files.keys()].sort();
  const cases = [];
  for (const skill of wanted) {
    if (!files.has(skill)) throw new Error(`no evals for skill: ${skill}`);
    const { evals } = JSON.parse(readFileSync(files.get(skill), 'utf8'));
    for (const item of evals) {
      const name = `${skill}-${item.id}`;
      const directory = join(outDir, name);
      rmSync(directory, { recursive: true, force: true });
      mkdirSync(join(directory, 'graders'), { recursive: true });
      writeFileSync(join(directory, 'prompt.md'), [
        '---',
        `name: ${name}`,
        `tags: [${skill}]`,
        `max_turns: ${maxTurns}`,
        'timeout_seconds: 600',
        'allowed_tools: [Read, Glob, Grep, Skill]',
        '---',
        '',
        item.prompt,
        '',
      ].join('\n'));
      writeFileSync(join(directory, 'graders', 'skill-fired.md'), [
        '---',
        'type: tool_used',
        'tool: Skill',
        `input_match: ${quote(`"skill"\\s*:\\s*"(?:[\\w-]+:)?${escapeRegex(skill)}"`)}`,
        '---',
        '',
        `The ${skill} skill was invoked.`,
        '',
      ].join('\n'));
      item.expectations.forEach((expectation, index) => {
        writeFileSync(join(directory, 'graders', `expectation-${String(index + 1).padStart(2, '0')}.md`), [
          '---',
          'type: llm',
          '---',
          '',
          `The agent was asked: ${item.prompt}`,
          '',
          `A strong answer overall: ${item.expected_output}`,
          '',
          `Judge only this expectation, and pass it only if the response meets it: ${expectation}`,
          '',
          'The agent had no project files to read unless the prompt supplied them. When an expectation depends on inspecting a repository, pass it if the response says what it would inspect and does not present unread facts as observed.',
          '',
        ].join('\n'));
      });
      cases.push(name);
    }
  }
  return { cases, outDir };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let outDir = join(ROOT, 'evals-generated');
  const skills = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--out') outDir = resolve(args[index += 1]);
    else skills.push(args[index]);
  }
  mkdirSync(outDir, { recursive: true });
  const { cases } = buildPluginEvals({ skills, outDir });
  console.log(`Wrote ${cases.length} case(s) to ${outDir}`);
}
