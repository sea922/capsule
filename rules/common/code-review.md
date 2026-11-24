# Code Review Standards

## Purpose

Code review ensures quality, security, and maintainability before code is merged. This rule defines when and how to conduct code reviews.

## When to Review

**Review triggers:**

- After writing or modifying code
- Before any commit to shared branches
- When security-sensitive code is changed (auth, payments, user data)
- When architectural changes are made
- Before merging pull requests

**Pre-Review Requirements:**

Before requesting review, ensure:

- All automated checks (CI/CD) are passing
- Merge conflicts are resolved
- Branch is up to date with target branch

## Review Checklist

Before marking code complete:

- [ ] Code is readable and well-named
- [ ] Functions are focused (about 50 lines is a signal to look, not a limit)
- [ ] Source files are cohesive (under the 800-line soft maintainability ceiling, or include a reason for a deliberate exception)
- [ ] No deep nesting (>4 levels)
- [ ] Errors are handled explicitly
- [ ] No hardcoded secrets or credentials
- [ ] No console.log or debug statements
- [ ] Tests exist for new functionality
- [ ] Test coverage meets the project's threshold

## Security Review Triggers

**Stop and use the `security-review` skill when the change touches:**

- Authentication or authorization code
- User input handling
- Database queries
- File system operations
- External API calls
- Cryptographic operations
- Payment or financial code

## Review Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability or data loss risk | **BLOCK** - Must fix before merge |
| HIGH | Bug or significant quality issue | **WARN** - Should fix before merge |
| MEDIUM | Maintainability concern, including an unexplained source file over the soft 800-line ceiling | **INFO** - Consider fixing |
| LOW | Style or minor suggestion | **NOTE** - Optional |

## Skill and Agent Usage

Use the `code-review` skill for the review itself: `quick`, `standard`, or
`deep`. Deep mode can add these read-only passes where the change touches their
area:

| Agent | Purpose |
|-------|---------|
| **code-review-silent-failures** | Swallowed errors and fallbacks that hide failure |
| **code-review-type-design** | Types that no longer enforce their invariants |
| **code-review-comments** | Comments and docs that contradict the code |
| **code-review-tests** | Tests that would not catch a regression |
| **java-reviewer** | Java, Spring Boot, and Quarkus changes |
| **database-migrations-reviewer** | Schema, migration, and query safety |
| **benchmark-auditor** | Whether a claimed speedup is supported by its measurement |
| **performance-reviewer** | Hot paths, unbounded work, bundle weight |
| **accessibility-reviewer** | User-interface accessibility |

Use the `security-review` skill for a dedicated security or privacy audit.

## Review Workflow

```
1. Run git diff to understand changes
2. Check security checklist first
3. Review code quality checklist
4. Run relevant tests
5. Check coverage against the project's threshold
6. Use the `code-review` skill for the detailed review
```

## Common Issues to Catch

### Security

- Hardcoded credentials (API keys, passwords, tokens)
- SQL injection (string concatenation in queries)
- XSS vulnerabilities (unescaped user input)
- Path traversal (unsanitized file paths)
- CSRF protection missing
- Authentication bypasses

### Code Quality

- Large functions (>50 lines) - split into smaller
- Large files (>800 lines) - extract modules
- Deep nesting (>4 levels) - use early returns
- Missing error handling - handle explicitly
- Mutation of shared or caller-owned data - prefer returning new values
- Missing tests - add test coverage
- Symptom-level bug fix - check the function's other callers; a guard in the
  shared function beats a guard repeated in each caller

### Performance

- N+1 queries - use JOINs or batching
- Missing pagination - add LIMIT to queries
- Unbounded queries - add constraints
- Repeated expensive work - measure before adding a cache

## Approval Criteria

- **Approve**: No CRITICAL or HIGH issues
- **Warning**: Only HIGH issues (merge with caution)
- **Block**: CRITICAL issues found

## Integration with Other Rules

This rule works with:

- [testing.md](testing.md) - Test coverage requirements
- [security.md](security.md) - Security checklist
- [git-workflow.md](git-workflow.md) - Commit standards
- [agents.md](agents.md) - Agent delegation
