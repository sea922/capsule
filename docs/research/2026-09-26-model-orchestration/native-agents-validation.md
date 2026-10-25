# Native agent definitions and setup

Follow-up to the [skill validation](skill-validation.md), dated 2026-09-26. The user requested reusable predefined agents in the repository, retaining separate Claude Code and Codex execution.

## Implementation basis

The [preferred-source ledger](preferred-sources.md) remains the source inventory for this design. This follow-up packages its role separation and bounded assignment decisions; it does not change repository preferences. Ten original definitions live with the skill, five for each host. Their `orchestrate-` prefix preserves existing unprefixed roles.

The [Claude plugin reference](https://code.claude.com/docs/en/plugins-reference) specifies that the manifest's `agents` field lists explicit Markdown files, not directories. The manifest now lists all five Claude definitions. The [subagent documentation](https://code.claude.com/docs/en/sub-agents) supplies native frontmatter, model aliases and tool allowlists. Plugin agents ignore certain fields such as permissionMode; these definitions do not use them. Read-only Claude reviewers receive the current diff from the parent because they have no shell tool.

Codex definitions follow the project's existing native TOML profile: routine `gpt-5.6-luna/max`, review `gpt-6-astra/low`, with read-only or workspace-write sandbox requests. Native tool availability remains runtime-specific; Codex instructions use capability descriptions rather than Claude tool identifiers. The existing project `.codex/` roles are preserved.

The project installer previews by default, applies only with `--apply`, preflights conflicts and refuses overwrites. It does not edit model profiles or global settings. No installer was applied to the actual project or user agent directories during this work.

## Validation

- `npm run check`: all 17 tests passed, followed by repository validation. Nine installer/packaging cases cover preview, both hosts, idempotence, conflict preflight, argument errors, directory escape, shipped assets, manifest entries and CLI invocation through a directory junction.
- Independent review identified a linked-path CLI entry bug; the installer now uses Node's main-module indicator and the junction regression passes. A write failure also identifies the possibly partial destination. Final review found no remaining material issue.
- Parsed all five Codex definitions with Python `tomllib`; names match filenames and model/effort values match the intended profile.
- Ran both hosts' installer previews against this repository: each reported five proposed files and performed no installation.
- `scripts/list-skills.sh` through Git for Windows Bash includes the new skill.
- `claude plugin validate . --strict`: passed; the CLI selects the marketplace manifest at this path.
- `claude plugin validate .claude-plugin/plugin.json`: passed with the existing root `CLAUDE.md` warning.
- The same explicit plugin validation with `--strict` fails solely on that warning: plugin-root `CLAUDE.md` is not loaded as project context. The file is retained for repository development; agent behavior is shipped in definitions and the skill.
- Package and plugin versions remain synchronized at `0.1.0`; the minor changeset now includes native agent packaging.

Live host discovery, model access and dispatch of the newly packaged definitions remain unverified. Static validation and temporary-project installer tests cannot prove those runtime properties. No benchmark or cost-saving claim is made.

## Explicit skills follow-up

The original role files did not explicitly load their workflow skills, and Claude allowlists omitted `Skill`. The roles now select their workflow skills before working and report loaded or missing skills. The parent supplies resolvable identifiers or file paths. Defaults remain optional when unavailable; a skill explicitly required by the assignment, user or repository blocks dependent work if missing.

The [Claude subagent reference](https://code.claude.com/docs/en/sub-agents#preload-skills-into-subagents), checked 2026-09-26, distinguishes startup `skills` preloading from runtime discovery through `Skill`. We use explicit runtime loading so the same definitions work with plugin-qualified identifiers and standalone skill installations. No assumption is made that parent-loaded skill content reaches the child. Codex uses native skill loading or reads the specified skill file; Claude-specific frontmatter is not added to TOML.

Role ownership remains authoritative for the assignment: skill steps needing unavailable tools, production edits by a tester, or extra delegation return to the root. This is especially relevant for `code-review` shell checks and `tdd` production implementation steps.

Validation after this follow-up: `npm run check` passed all 18 tests and repository validation; all five TOML definitions parsed with `tomllib`. The new YAML check verifies Skill access for all Claude roles without adding Agent or reader edit/shell tools. Independent review identified an ambiguity about assignment-required skills; all ten roles now block dependent work for those missing skills as well. Live skill invocation in either host remains untested.
