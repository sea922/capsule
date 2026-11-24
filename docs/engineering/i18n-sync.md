# i18n sync

Use `i18n-sync` to keep locale files in step with the application's source strings.

Examples:

- “Sync the German and French files with the new English keys.”
- “The English copy changed. Update the translations.”
- “Add Japanese.”
- “Find dead keys in our locale files.”

The skill reads the i18n setup from the repository: library, file format, source and target locales, who owns the files, and any glossary or style guide. It builds a worklist that classifies each difference as missing, unused, orphaned, stale, untranslated, or structural, and says when staleness cannot be established. For each string it reads the code that uses the key, so the translation fits a button, an error, or a fragment, and it follows the project's terminology and existing wording.

Placeholders, plural forms, and markup are preserved, and only worklist keys change, so the diff shows translations and nothing else. Existing translations are never overwritten silently, and unused keys are deleted only after confirmation. Verification parses each changed file, checks key parity and placeholder parity against the source, and runs the project's own checks. The report separates what was changed, what awaits confirmation, and what needs a native speaker.

JSON is the worked example; the method applies to YAML, PO, ARB, XLIFF, and other formats.

## Workflow fit

`implement` owns moving hardcoded strings into keys. `interface-polish` and `accessibility` own how translated text fits and reads in the interface.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/i18n-sync/SKILL.md).
