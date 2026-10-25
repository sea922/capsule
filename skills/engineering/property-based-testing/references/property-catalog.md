# Property catalog

Choose from this catalog after reading the code's contract. Strength runs from 1 (weakest) to 5 (strongest). A stronger property usually implies several weaker ones, so assert down the list only for behavior the strong property leaves unconstrained.

| Property | Shape | Strength | Typical targets |
| --- | --- | --- | --- |
| No crash / error contract | `f(x)` returns or raises only documented errors | 1 | Decoders over arbitrary bytes, validators, parsers of untrusted input |
| Type or shape preserved | Output length, key set, or type follows from input | 2 | Mappers, formatters, sort (length) |
| Invariant | A predicate holds after every operation | 3 | Balanced trees, sorted containers, money totals, unique IDs |
| Easy to verify | A cheap checker validates an expensive result | 3 | `is_sorted(sort(x))`, a path is valid in the graph, a solution satisfies its constraints |
| Idempotence | `f(f(x)) == f(x)` | 4 | Normalizers, formatters, deduplication, upserts, migrations |
| Commutativity | `f(a, b) == f(b, a)` | 4 | Set union, merge of CRDTs, max, order-independent aggregation |
| Associativity | `f(f(a, b), c) == f(a, f(b, c))` | 4 | Combining, concatenation, reduce in parallel chunks |
| Identity | `f(x, e) == x` | 4 | Operations with a neutral element: empty list, zero, empty config |
| Monotonicity | `a <= b` implies `f(a) <= f(b)` | 4 | Pricing tiers, scoring, rate limiters, version comparison |
| Metamorphic relation | A known change to input gives a predictable change to output | 4 | Search (adding a non-matching document leaves results unchanged), ML or numeric code with no exact oracle, `sort(reverse(x)) == sort(x)` |
| Round-trip / inverse | `decode(encode(x)) == x` | 5 | Serializers, codecs, parsers with renderers, compress, encrypt |
| Oracle | `fast(x) == reference(x)` | 5 | Optimizations, rewrites, ports, a cache in front of a pure function |
| Model agreement (stateful) | A random command sequence against the system and a simple model yields the same observations | 5 | Stores, queues, caches, APIs with state, data structures |

## Choosing well

- **Round-trip needs the right direction.** `decode(encode(x)) == x` is total when every value is encodable. `encode(decode(s)) == s` holds only for canonical input; for arbitrary accepted text, assert that one parse-and-render pass is idempotent: with `t = encode(decode(s))`, `encode(decode(t)) == t`.
- **An oracle must be independent.** A reference built from the same helper, regex, or library call as the implementation is a tautology. Good oracles: a slow brute-force version, the previous release, a well-known library, or a trivially correct model (a list standing in for a priority queue).
- **Metamorphic relations rescue code with no oracle.** When the exact answer is unknowable, relate two runs: permuting input rows leaves an aggregate unchanged, scaling all prices by 2 doubles the total, adding a filter never grows the result set.
- **Stateful models find ordering bugs.** Generate sequences of operations (insert, delete, lookup, expire) and compare every observable against a plain in-memory model. Shrinking then produces the shortest failing sequence.
- **Error contracts count.** For a decoder, "returns a value or raises `DecodeError`, never `IndexError`, never hangs" is weak but worth writing over arbitrary bytes. Catch only the documented error.
- **Type bounds are not properties.** `unsigned >= 0`, `len(x) >= 0`, or anything the type system guarantees can never fail.

## Exposing a buried shape

"No shape" is often a fact about arrangement, not behavior. Each move below unlocks a stronger property; propose it and let the author decide, since changing production code for a test is their call.

| Arrangement | Move | Unlocks |
| --- | --- | --- |
| Calculation wrapped in I/O | Extract the pure core that takes values and returns a value | Invariants, monotonicity, oracle on the core; example tests with a fake keep the thin I/O wrapper |
| One-way transform | Add the inverse, in production or test code only | Round-trip |
| String built by concatenation | Build a structured value, then render it | Round-trip over render and parse, where escaping bugs live |
| In-place mutation | Return a new value, or wrap with copy-and-return | Before-and-after comparison, idempotence, permutation checks |
| Reads globals, environment, or clock | Pass the dependency as a parameter | Generator can drive bounds to 0, 1, and extremes; determinism |

Do not propose a refactor when it would unlock only "no crash", when the module needs a wholesale rewrite (say so once), or when it breaks a public API without a compatible alternative. Run existing tests after any accepted refactor.
