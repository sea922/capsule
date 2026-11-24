---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go Testing

> This file extends [common/testing.md](../common/testing.md) with Go specific content.

## Framework

Use the standard `go test` with **table-driven tests**.

## Race Detection

Run tests with the `-race` flag by default:

```bash
go test -race ./...
```

## Coverage

```bash
go test -cover ./...
```

## Related capsule Skills

Use the `tdd` skill for test-first work and `property-based-testing` for generated cases.
