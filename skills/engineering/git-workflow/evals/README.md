# Evaluating git-workflow

## Blind scenarios

`evals.json` is evaluator-only: it contains expected outcomes. Give a subject only
the `prompt` for each case. The baseline receives no skill; the treatment receives
SKILL.md and only references its conditions require. Use separate fresh contexts
and identical models/settings. Neither subject reads this directory or sees the
rubric. Capture answers before scoring; grade each against `expected_output` and
record concrete omissions and unsafe proposed actions. Keep results under
`docs/research/` when working in this repository.

The scenarios assess proposed behavior, not execution. Do not turn a passing
answer into a claim that live Git state was preserved. Expand with changed branch
names, fork remotes, mixed hunks, absent protections data, and negative trigger
cases before claiming robust routing. Repeat across runs to measure variance.

## Disposable Git exercises

From the repository root, run:

```sh
node --test skills/engineering/git-workflow/evals/git-lab.test.mjs
```

Requires Node.js and Git on PATH. The lab creates temporary repositories and local
remotes, isolates Git configuration/hooks, and checks actual revision/index/file
state. It does not contact a forge or exercise managed host archival. It verifies
command mechanics used by the recipes, not that an agent chooses those commands
correctly. Inspect both forms of evidence before changing instructions.

## Helper CLI checks

```sh
node --test skills/engineering/git-workflow/evals/git-kit.test.mjs
```

These test the shipped helper itself: reference resolution and error messages,
dirty-state preservation, command-line rejection, linked-install execution,
portable asset lookup, exclusive draft creation, and filled commit templates.
Unlike the Git lab's illustrative recipes, failures here indicate a defect in a
runnable kit artifact. Run both suites after changing shared workflow
assumptions. Neither suite publishes a PR.
