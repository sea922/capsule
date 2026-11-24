# Common Patterns

## Skeleton Projects

When starting a new project or a large new area, and the user agrees:
1. Search for battle-tested skeleton projects with a compatible license
2. Evaluate the options, in parallel where it helps:
   - Security assessment
   - Extensibility analysis
   - Relevance scoring
   - Implementation planning
3. Clone best match as foundation
4. Iterate within proven structure

## Design Patterns

Use a pattern when the project already uses it or a present need calls for it,
not by default. The `codebase-design` skill covers when an abstraction earns
its place.

### Repository Pattern

Encapsulate data access behind a consistent interface:
- Define standard operations: findAll, findById, create, update, delete
- Concrete implementations handle storage details (database, API, file, etc.)
- Business logic depends on the abstract interface, not the storage mechanism
- Enables easy swapping of data sources and simplifies testing with mocks

### API Response Format

Follow the project's existing response shape. Where it has none, use a
consistent envelope for API responses:
- Include a success/status indicator
- Include the data payload (nullable on error)
- Include an error message field (nullable on success)
- Include metadata for paginated responses (total, page, limit)
