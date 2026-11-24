import { readFileSync } from 'node:fs';

// Every capsule hook can be switched off by id, e.g. CAPSULE_HOOKS_DISABLED=config-protection.
export function isDisabled(id, env = process.env) {
  return (env.CAPSULE_HOOKS_DISABLED ?? '').split(',').map((value) => value.trim()).includes(id);
}

// Unreadable input allows the tool call: these hooks guard habits, not a security boundary.
export function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

export function runHook(id, decide) {
  const input = readInput();
  if (!input || isDisabled(id)) process.exit(0);
  const reason = decide(input);
  if (reason) {
    process.stderr.write(`${reason}\n(capsule hook ${id}; disable with CAPSULE_HOOKS_DISABLED=${id})\n`);
    process.exit(2);
  }
  process.exit(0);
}
