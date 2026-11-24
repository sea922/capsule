---
paths:
  - "**/*.go"
  - "**/go.mod"
  - "**/go.sum"
---
# Go Coding Style

> This file extends [common/coding-style.md](../common/coding-style.md) with Go specific content.
>
> These are defaults. The project's configuration and existing code decide where they differ; see [precedence](../common/precedence.md).

## Formatting

- **gofmt** and **goimports** are mandatory — no style debates

## Design Principles

- Accept interfaces, return structs
- Keep interfaces small (1-3 methods)

## Error Handling

Wrap errors with context by default:

```go
if err != nil {
    return fmt.Errorf("failed to create user: %w", err)
}
```

## Related capsule Skills

Use the `coding-standards` skill to apply or define a project's conventions;
it has a Go reference that goes deeper than these rules.
