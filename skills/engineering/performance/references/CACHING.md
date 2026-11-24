# Caching by content hash

Read this when the confirmed limiter is repeated expensive work on inputs that
rarely change: parsing documents, extracting text, transforming images,
compiling, or analyzing files. The pattern stores each result under a hash of
what produced it, so an unchanged input is never processed twice and a changed
one is never served stale.

## Decide whether to cache at all

Measure first. Caching earns its place when the work is expensive, the same
inputs recur across runs, and the result is a pure function of things you can
name. Do not cache when:

- the result depends on something outside the key, such as the clock, the
  network, a database row, or the current user;
- the data must always be fresh;
- the work costs about as much as hashing the input and reading the entry;
- entries would be so large that storing them costs more than recomputing;
- the result contains secrets or personal data the cache location is not
  allowed to hold.

A cache also hides the slow path. Fix a wasteful algorithm before caching
around it.

This reference covers results derived from files and other stable inputs. For
caching responses at request time, with expiry, stampede protection, and
eviction, use the `database-design` skill's Redis reference.

## Build the key

Hash the content, not the path. A renamed or moved file then still hits, and
an edited one misses without any invalidation logic. Read large inputs in
chunks while hashing, and use a cryptographic hash so that an accidental
collision is not a practical concern.

The key must cover everything that can change the result:

- the input bytes;
- every option that affects the output, serialized in a stable order;
- the version of the processing code, or a format version you bump whenever
  its output changes;
- the versions of tools, models, or data files the processing relies on.

A missing ingredient is the usual bug: the cache returns a result made with
old options or old code and nothing reports an error. If you cannot list the
ingredients with confidence, do not cache.

A file's size and modification time are a faster but weaker check. Use them
only to skip rehashing, and only where a wrong hit is cheap.

## Store entries

- One entry per key, in a file or row named by the hash, so a lookup needs no
  index and entries never need reconciling.
- Write to a temporary name and rename into place, so a crash or a concurrent
  writer never leaves a half-written entry.
- Record in each entry the format version and enough about its origin to debug
  it, such as the original name and creation time.
- Treat an unreadable or malformed entry as a miss: recompute and overwrite.
  Never fail the run because of the cache.
- Keep the cache in a directory meant for disposable data and out of version
  control. Deleting it must always be safe.

## Keep it separate

Leave the processing function pure and unaware of the cache. Put the lookup,
the call, and the store in a thin wrapper around it. The function stays
testable alone, and the cache can be bypassed with one switch. Give users that
switch, such as a no-cache option, and a way to clear the cache.

## Invalidate and bound

Content keys remove most invalidation: stale entries are simply never asked
for again. What remains is space. Bound the cache by total size or entry age,
and evict the least recently used entries. When the output format changes,
bump the version in the key and leave old entries to be evicted.

## Verify that a hit is correct

- Test the wrapper: the same input twice processes once; changed content, a
  changed option, and a bumped version each miss; a corrupt entry recomputes.
- For a sample of inputs, compare the cached result with a fresh one, and
  repeat the comparison after changing the processing code.
- Log hits and misses with a shortened hash, and report the hit rate. A rate
  near zero means the key includes something unstable, such as a timestamp or
  an absolute path. A rate of one hundred percent right after a code change
  means the key is missing the version.
- Measure again with a cold and a warm cache, on the same inputs as the
  baseline, and report both figures.
