# Testing Requirements

## Test Coverage

Meet the project's coverage threshold. Where it sets none, treat 80% of new
code as a reasonable target, not a gate: a covered line is not a tested
behavior.

Test types, each where the change needs it:
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (framework chosen per language)

## Test-Driven Development

For new behavior and bug fixes, use the `tdd` skill:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Check coverage against the project's threshold

## Troubleshooting Test Failures

1. Use the `diagnosing-bugs` skill when the cause is not clear
2. Check test isolation
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)

## Skill Support

- `tdd` - test-first development and regression tests
- `property-based-testing` - properties and generators
- `code-review-tests` agent - whether tests would catch the change breaking

## Test Structure (AAA Pattern)

Prefer Arrange-Act-Assert structure for tests:

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Test Naming

Use descriptive names that explain the behavior under test:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```
