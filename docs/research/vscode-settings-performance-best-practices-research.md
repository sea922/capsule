# Research: VS Code settings for performance and best practices

**Research date:** 2026-09-02

**Target inspected:** `C:/Users/joevr/AppData/Roaming/Code - Insiders/User/settings.json`

**VS Code build inspected:** 1.135.0-insider (`0052619e71feb774a574b37f4f2ea20c36547373`, x64)

**Scope:** current VS Code and TypeScript primary documentation, current VS Code source and issue evidence, a last-30-days community scan, and the preferred repositories listed in `docs/source-repos.md`. This report is research only; it does not modify the user's VS Code settings.

## Executive finding

There is no trustworthy universal “fast VS Code” settings file. VS Code's own performance workflow starts by identifying whether the busy process is the renderer, extension host, file watcher, search process, terminal, or language server. Profiles, Process Explorer, `code --status`, Startup Performance, and Extension Bisect produce stronger evidence than accumulating global toggles ([VS Code performance guide](https://github.com/microsoft/vscode/wiki/Performance-Issues); [Extension Bisect](https://code.visualstudio.com/blogs/2021/02/16/extension-bisect)).

For the inspected settings, two changes have direct, high-confidence support:

1. Change `terminal.integrated.gpuAcceleration` from `"off"` to `"auto"`, unless GPU rendering is known to be broken. `off` selects the slower DOM renderer; `auto` uses the accelerated renderer when supported ([terminal appearance](https://code.visualstudio.com/docs/terminal/appearance)).
2. Change `github.copilot.chat.agentDebugLog.fileLogging.enabled` from `true` to `false` outside an active diagnostic session. The setting defaults to false and writes agent debug events to JSONL files on disk ([AI settings reference](https://github.com/microsoft/vscode-docs/blob/main/docs/agents/reference/ai-settings.md)).

The global watcher exclusions deserve redesign rather than expansion. Current VS Code source intentionally uses simpler watcher defaults after evidence that complex leading `**/` patterns can impose substantial costs in large workspaces. Issue #305923 reported roughly 120 seconds with the older wildcard form versus 16 seconds with simpler patterns in the reporter's workload; this is a case study, not a universal benchmark ([current files settings schema](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/files/browser/files.contribution.ts); [issue #305923](https://github.com/microsoft/vscode/issues/305923)). Generated outputs should normally be excluded at workspace scope, using the narrowest patterns that match that repository.

The TypeScript settings are valid but are trade-offs, not general best practices. A 4096 MB TS Server cap should be retained only when profiling or crashes show memory pressure. Disabling automatic type acquisition and auto-imports reduces background work but also removes useful JavaScript/TypeScript assistance. Large-project performance is usually better addressed first through deliberately scoped `tsconfig.json` files and project references ([TypeScript performance guidance](https://github.com/microsoft/TypeScript/wiki/Performance)).

## Prioritized recommendations for the current file

| Priority | Current setting | Recommendation | Confidence and rationale |
| --- | --- | --- | --- |
| 1 | `terminal.integrated.gpuAcceleration: "off"` | Use `"auto"` unless diagnosing a driver or rendering defect. | High. `off` deliberately selects the slower renderer. |
| 2 | `github.copilot.chat.agentDebugLog.fileLogging.enabled: true` | Use `false`; temporarily enable only while collecting diagnostics. | High. It is opt-in file logging and defaults off. |
| 3 | Six global `files.watcherExclude` entries using `**/.../**` | Remove the global cargo-cult block, then add only measured, repository-specific build outputs in workspace settings using simple patterns. Do not blindly exclude every `.git` directory. | Medium-high. The scopes have different effects, and current VS Code source moved away from expensive complex watcher defaults. Verify CPU and file-change behavior after each adjustment. |
| 4 | `js/ts.tsserver.maxMemory: 4096` | Keep only if TS Server memory pressure is observed; do not raise it as a generic speed tweak. | High. This is a memory cap, not a speed control. The current setting name is valid; `typescript.tsserver.maxTsServerMemory` is deprecated ([current schema text](https://github.com/microsoft/vscode/blob/main/extensions/typescript-language-features/package.nls.json)). |
| 5 | Automatic type acquisition and auto-imports disabled | Keep only as an intentional functionality trade-off, preferably scoped to workspaces that need it. | High. These controls remove background features, but the usability loss may outweigh an unmeasured performance benefit. |
| 6 | Broad global `search.exclude` entries | Keep universally noisy paths modest; put `dist`, `out`, `coverage`, `.angular`, and other project outputs in the relevant workspace settings. | Medium-high. `search.exclude` affects search and workspace context, but project-specific global rules can hide useful files elsewhere. |

No primary evidence found a material general benefit from disabling the minimap, CodeLens, caret animation, Git auto-refresh, or other small UI features in this file. Leave them as preferences unless a profile isolates one as a bottleneck.

## A safer settings shape

The only broadly supported user-level performance corrections are:

```jsonc
{
  "terminal.integrated.gpuAcceleration": "auto",
  "github.copilot.chat.agentDebugLog.fileLogging.enabled": false
}
```

Keep generated-directory rules close to the repository that creates those directories. For example, a workspace that actually produces these paths could use:

```jsonc
{
  "search.exclude": {
    "dist": true,
    "out": true,
    "coverage": true
  },
  "files.watcherExclude": {
    "dist/**": true,
    "out/**": true,
    "coverage/**": true
  }
}
```

These are examples, not a block to copy into every project. `files.exclude`, `search.exclude`, and `files.watcherExclude` are separate controls:

- `files.exclude` hides matching files in Explorer and also narrows text, grep, and semantic indexing used for workspace context.
- `search.exclude` keeps files visible but removes them from text and grep search.
- `files.watcherExclude` suppresses filesystem events; overly broad entries can prevent expected change detection.

The first two can reduce search, semantic-index, agent-context, and token noise when used deliberately ([workspace context](https://code.visualstudio.com/docs/agents/reference/workspace-context); [settings scopes](https://code.visualstudio.com/docs/configure/settings)). The file watcher is separate, and extension-specific watchers may not honor VS Code's core exclusions, so this setting is not a universal cure ([file watcher guide](https://github.com/microsoft/vscode/wiki/File-Watcher-Issues)).

## Evidence-first diagnostic workflow

1. Reproduce the slowdown in the same workspace and record when it occurs: startup, typing, search, source control, terminal rendering, or idle CPU.
2. Open **Help: Open Process Explorer** or run `code-insiders --status` to identify the busy process.
3. Open the workspace with an **Empty Profile** or run once with extensions disabled. An Empty Profile removes both modified settings and extensions, providing a clean control ([profiles](https://code.visualstudio.com/docs/configure/profiles)).
4. If extensions are implicated, run **Help: Start Extension Bisect**. It narrows a large extension set logarithmically instead of requiring blanket removal.
5. For startup problems, use **Developer: Startup Performance** or a startup profile. For an extension-host problem, use **Developer: Show Running Extensions** and capture a profile.
6. For TS Server problems, inspect the workspace's `tsconfig.json` scope, `@types` acquisition, and project graph before increasing memory. Use TS Server traces or TypeScript's extended diagnostics when needed.
7. Change one setting at a time, repeat the same workload, and retain only changes with a visible or measured effect.

For remote projects, place host-specific tuning in Remote settings. Workspace settings override Remote settings, which override User settings. Running the workspace and its extensions near the source is generally preferable to mounting it over SSHFS for bulk filesystem operations ([Remote SSH](https://code.visualstudio.com/docs/remote/ssh); [Remote FAQ](https://code.visualstudio.com/docs/remote/faq)). On a demonstrably high-latency remote connection, disabling terminal file-link verification at remote or workspace scope can be tested, but it should not be a global default ([terminal basics](https://code.visualstudio.com/docs/terminal/basics)).

## TypeScript and JavaScript details

The inspected file uses the current consolidated setting names:

- `js/ts.tsserver.maxMemory`
- `js/ts.tsserver.automaticTypeAcquisition.enabled`
- `js/ts.suggest.autoImports`

For large repositories, TypeScript's primary guidance is to keep project inputs precise and split very large programs with project references. A practical target is several coherent projects rather than one giant program or hundreds of tiny ones. `include`, `files`, `exclude`, and `types` determine how much work the language server must perform. Memory tuning comes after the project graph is understood ([TypeScript performance](https://github.com/microsoft/TypeScript/wiki/Performance); [VS Code TypeScript issue guide](https://github.com/microsoft/vscode/wiki/TypeScript-Issues)).

`js/ts.tsserver.maxMemory: 4096` is therefore not wrong, but no evidence in this audit shows that the current workload needs it. Disabling automatic type acquisition and auto-imports may be reasonable in a very large or constrained workspace; elsewhere it gives up declaration acquisition and suggestions for an unquantified saving.

## Adjacent best-practice concern

The file enables global tool auto-approval, terminal approval for `**/*`, edit approval for sensitive paths such as `.git` and `.env`, and Claude Code permission bypass. These controls are not performance settings, so they are outside the tuning recommendations. They materially reduce safety boundaries and should be reviewed separately rather than treated as performance optimizations. Workspace Trust remains VS Code's primary boundary for deciding whether code in a folder may execute ([Workspace Trust](https://code.visualstudio.com/docs/editing/workspaces/workspace-trust)).

## Last-30-days community scan

The scan covered 2026-08-03 through 2026-09-02 and returned 10 items: five Reddit threads, four Hacker News stories, and the `microsoft/vscode` GitHub repository result. Reddit stopped after five items with HTTP 429; X, YouTube, TikTok, and Instagram were unavailable. Most candidates were product-release or extension posts rather than reproducible settings benchmarks.

The recent corpus therefore does **not** establish a community consensus about a universal performance configuration. Current first-party documentation and source evidence carry the recommendations above. The raw artifact is preserved at:

`C:/Users/joevr/Documents/Last30Days/visual-studio-code-settings-performance-and-best-practices-raw-v3.md`

## Preferred repository coverage

The preferred repositories were checked in the order documented by this repository. Their current HEAD revisions were recorded so the negative results are reproducible.

| Preferred repository | Revision inspected | Influence on this research |
| --- | --- | --- |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76` | No topical VS Code performance-settings guidance found; not applicable. |
| [`obra/superpowers`](https://github.com/obra/superpowers) | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | A VS Code integration issue was incidental; no performance-settings guidance found. |
| [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | `d2c37ef6225dd8726cdd369a8030307f48592d26` | Incidental editor references only; no influence on the settings recommendations. |
| [`cursor/plugins`](https://github.com/cursor/plugins), especially `pstack` | `efa2a531985e0a8084d36ff3cf87233be8a9f34b` | Cursor-specific configuration, not VS Code performance guidance; not applicable. |
| [`DietrichGebert/ponytail`](https://github.com/DietrichGebert/ponytail) | `2ed6c52c9d7e5e56942508591085fd45dea277d3` | Recent VS Code references concern Claude Code extension and hook behavior, not general VS Code settings; not applicable. |
| [`mvanhorn/last30days-skill`](https://github.com/mvanhorn/last30days-skill) | `1f378527b229ffcb00102b6440e49fa06c582443` | Directly influenced the recency-search method and the explicit coverage qualification; it did not determine the configuration recommendations. |

GitHub's code-search API rate-limited the exact repository queries during this run, so the preferred-repository check was completed with repository-scoped web search and current remote HEAD verification. Negative results should be read as “no relevant material found in this bounded search,” not proof that none exists anywhere in repository history.

## Decision summary

Apply the two direct corrections first: restore terminal GPU acceleration to `auto` and turn agent debug file logging off. Then establish an Empty Profile baseline and diagnose any remaining problem before changing exclusions or language features. Move project-generated exclusions out of the global user file as each workspace is measured. Treat TS Server memory and disabled IntelliSense features as explicit workload choices, not inherited performance folklore.
