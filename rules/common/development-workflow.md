# Development Workflow

> This file extends [common/git-workflow.md](./git-workflow.md) with the full feature development process that happens before git operations.

The Feature Implementation Workflow describes the development pipeline: research, planning, TDD, code review, and then committing to git. Scale it to the task: a one-line fix does not need every step.

## Feature Implementation Workflow

0. **Research & Reuse** _(before any new implementation)_
   - **Search this repository first** for an existing function, module, or pattern that already does the job.
   - **Library docs second:** use the `research` skill and primary vendor docs to confirm API behavior, package usage, and version-specific details before implementing.
   - **Check package registries:** search npm, PyPI, crates.io, and other registries before writing utility code. Prefer battle-tested libraries over hand-rolled solutions, and ask before adding a dependency.
   - **Search for adaptable implementations:** look for open-source projects that solve most of the problem and can be ported or wrapped, within their license.
   - Prefer adopting or porting a proven approach over writing net-new code when it meets the requirement.

1. **Plan First**
   - Use the `planning-and-task-breakdown` skill for work with dependent steps
   - For larger work, use the ADLC skills: `/adlc-intent`, `/adlc-spec`, `/adlc-plan`
   - Identify dependencies and risks
   - Break down into verifiable slices

2. **TDD Approach**
   - Use the `tdd` skill
   - Write tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor (IMPROVE)
   - Meet the project's coverage threshold where it sets one

3. **Code Review**
   - Use the `code-review` skill after writing code, and `security-review` for sensitive changes
   - Address CRITICAL and HIGH issues
   - Fix MEDIUM issues when possible

4. **Commit & Push**
   - Only when the user asks
   - Follow the project's commit format, or conventional commits where it has none
   - See [git-workflow.md](./git-workflow.md) for commit message format and PR process

5. **Pre-Review Checks**
   - Verify all automated checks (CI/CD) are passing
   - Resolve any merge conflicts
   - Ensure branch is up to date with target branch
   - Only request review after these checks pass

6. **Before Saying It Is Done**
   - Use the `verification-before-completion` skill: fresh evidence for every claim
