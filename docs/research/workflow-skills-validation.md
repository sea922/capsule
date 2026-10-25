# Workflow Skills Validation

Date: 2026-09-06. Scope: five new skills and the connecting changes described in the [ecosystem research](preferred-skill-repositories-workflow-gap-research.md). This is a validation record, not a claim of measured improvement over an unassisted agent.

## Packaging and preservation

- The inventory contains 20 distinct skills, with every leaf represented in the plugin manifest.
- The five new skills have matching directory/frontmatter names, UI metadata, three evaluation cases each, top-level and bucket index entries, and human-facing pages.
- Plugin and package versions remain synchronized at `0.1.0`; a minor changeset records the additions for the release workflow.
- All 20 frontmatter blocks parse with the repository's existing `js-yaml`. Invocation policies remain consistent, including explicit-only Agile skills.
- The bundled `quick_validate.py` passes for the five new skills and the modified model-invoked skills: implement, grilling, code-review, and verification-before-completion. The validator's PyYAML dependency was supplied through an isolated `uv run --no-project --with pyyaml` environment after the default Python lacked it.
- Local Markdown links across skills, docs, and the top-level README were checked for existing targets. Repository whitespace checks pass; new artifacts were also inspected because ordinary Git diffs omit untracked files.
- Hash comparisons against the start of this turn found only the intended existing-file updates and no deleted files. Existing `AGENTS.md`, `CLAUDE.md`, package metadata, preferred-source list, and unrelated work were preserved. Nothing was staged or committed.

The repository-required `claude plugin validate . --strict` passes, but resolves to the marketplace manifest. An additional direct `claude plugin validate .claude-plugin/plugin.json` passes with an existing warning that root `CLAUDE.md` is not loaded as plugin context. Adding `--strict` to that direct check fails on this warning. Root `CLAUDE.md` is unchanged and contains repository maintenance guidance; this run does not claim it is shipped as runtime context. The warning remains unresolved.

## Independent forward-tests

Three fresh agents received the new skills and small synthetic tasks without the research conclusions or evaluation expectations. Their outputs covered all five skills. Root inspected the saved artifacts and reran the queue experiment and synthetic tenant check.

| Exercise | Observed result | Evidence limit |
| --- | --- | --- |
| Security review of a supplied tenant export handler | Identified missing resource authorization after login, specified attacker access and impact, and returned closing checks. A local in-memory check confirmed own-tenant access, cross-tenant disclosure, and rejection without authentication. | Synthetic code path only; no real service, session cryptography, deployment, or exploit discovery was tested. |
| Queue-state prototype | Created and ran a Node experiment. Six guarded event sequences passed; two unguarded negative controls reproduced stale A completion corrupting B. Root reran the artifact with the same result. | The controls compare queue implementations, not agents with and without the skill. Persistence, distributed concurrency, and production cancellation are untested. |
| Portable handoff after the prototype | Saved current state, artifact links, observed output, limitations, authority, next command, and a pause boundary. All required files were present and readable. | Checked one creation/pause case; a fresh pickup from stale or conflicting state was not executed. |
| Research on supplied SDK fixtures | Saved a report distinguishing the supplied 2.4 contract, its 24-hour idempotency guarantee, and a 3.0 marketing claim. Sources were clearly labeled synthetic; missing resumability evidence was not turned into a claim of absence. | No real SDK, lockfile, official website, or network retrieval was exercised. |
| Planning from that research | Saved slices E1 through E5, verifiable outcomes, dependencies, combined acceptance, and decision owners. Discovery E1 could start while production implementation remained blocked by missing project and contract evidence. | No actual application was inspected or implemented. |

Local retained artifacts:

- Queue experiment and handoff: `C:\Users\joevr\AppData\Local\Temp\queue-state-prototype-a00a4f8cec9248d895276c590d3d2a80\queue.mjs` and `HANDOFF.md` in the same directory.
- Research and plan: `C:\Users\joevr\AppData\Local\Temp\tenant-export-forward-test-07cd01ac29a24b4fa14b4bc84004e94f\docs\research\tenant-export-research.md` and `docs\plans\tenant-exports.md` under that same temporary root.

These temporary artifacts may be removed by host cleanup. The observed outcomes are retained above; the 15 reusable scenario prompts remain under the five skill directories in `evals/evals.json`.

## Corrections and remaining coverage

The planning/research exercise identified two wording ambiguities. The planning skill now defines ready as ready to start and distinguishes entry prerequisites from decisions a slice produces. Research now explicitly returns to the next already-requested workflow, including research-to-planning. These narrow corrections were reviewed and structurally revalidated; the full forward-tests were not repeated afterward.

The fifteen scenario definitions include no-change boundaries, degraded research sources, dependency-advisory applicability, existing security controls, rendering limitations, stale handoffs, and secret handling. They were schema-checked, not all executed. No paired no-skill baseline, multi-run reliability measurement, live upstream research test, or rendered-UI experiment was performed. The workflow Mermaid source was inspected; visual rendering was not verified.

The completed checks support publication structure and the observed synthetic applications. They do not establish a measured behavioral advantage or exhaustive safety coverage.
