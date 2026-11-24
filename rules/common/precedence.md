# Precedence

These rules are defaults. When they conflict with something more specific, the
more specific source wins, in this order:

1. What the user asks for in this conversation.
2. The project's own instructions: `CLAUDE.md`, `AGENTS.md`, and its other rules.
3. The project's tooling: linter, formatter, type-checker, and test
   configuration, and the patterns the existing code already follows.
4. These rules.

Never change a linter, formatter, or test configuration to make a check pass.
When a default here contradicts the project, follow the project and say nothing;
when the project is silent and the choice matters, follow the default and say
which one you applied.
