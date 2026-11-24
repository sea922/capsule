# Security Guidelines

## Security Checks

Before a commit that touches code or configuration, check what applies:
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitized HTML)
- [ ] CSRF protection enabled
- [ ] Authentication/authorization verified
- [ ] Rate limiting on public endpoints
- [ ] Error messages don't leak sensitive data

## Secret Management

- Never hardcode secrets in source code
- Use environment variables or a secret manager
- Validate that required secrets are present at startup
- Rotate any secrets that may have been exposed

## Security Response Protocol

If security issue found:
1. Stop and tell the user
2. Use the `security-review` skill
3. Fix CRITICAL issues before continuing
4. Rotate any exposed secrets
5. Review entire codebase for similar issues

See [untrusted-content.md](./untrusted-content.md) for text that arrives
through tools, and use `security-review` for a dedicated audit.
