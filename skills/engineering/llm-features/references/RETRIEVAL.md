# Retrieval

Load this when a feature answers from documents it looks up at request time, or when such a feature returns wrong, unsupported, or stale answers.

Vector stores, embedding models, rerankers, and index parameters differ by provider and change often. Read the current documentation for the ones in use, and keep model identifiers, dimensions, and index settings in configuration.

## Decide whether to retrieve

Retrieval earns its place when the knowledge is too large for the prompt, changes faster than a prompt or a tuned model can follow, differs per user or tenant, or must be cited. Prefer something simpler when it works:

- **A longer prompt** when the whole corpus fits comfortably and is the same for every request. A stable prefix can be cached; see [COST.md](COST.md).
- **Ordinary search or a database query** when the question is a lookup by key, date, or exact term. A model can call it as a tool.
- **Fine-tuning** changes how a model behaves, not what it knows today. It does not replace retrieval for facts that change or need a source.

Add retrieval only after an eval shows the simpler version failing for lack of knowledge, not for lack of instruction.

## Trace the path first

Before changing anything, follow one real request end to end: how the user's input becomes a query, what the search returns, what is filtered, reordered, truncated, or capped, and the exact context the model receives. Defects hide in the steps between search and prompt. Note whether production inputs are short questions or whole documents with several topics; one query built from a long document tends to lose its later sections.

## Chunk along the document's structure

- Split at the boundaries the author made: headings, sections, list items, table rows, functions. A fixed-size window that cuts through a table or a clause produces chunks that cannot answer anything.
- Keep enough context with each chunk to stand alone: the title and heading path, and the date or version where it matters.
- Size chunks for the questions asked. Small chunks find precise facts and lose surrounding meaning; large ones do the reverse. Choose by measured recall on real questions, not by a default.
- Store the source identifier, location, access attributes, and last-modified time with every chunk. Citations, permissions, and re-indexing all depend on them.
- Remove repeated boilerplate such as headers, footers, and navigation before indexing, or it will crowd out real evidence.

## Embeddings and the index

- The same embedding model and version must be used for indexing and for queries, with the query and document conventions that model documents. Changing any of them means re-embedding the corpus; record the model with the index so a mismatch is detectable.
- Choose the embedding model by retrieval recall on the project's own questions and languages, then by cost and latency. A public leaderboard is a starting list, not a result.
- An exact search is the baseline. Use an approximate index when the corpus needs it, and measure the recall it gives up against the exact result on a sample.
- Filter by metadata (tenant, language, date, document type) inside the search where the store supports it. Filtering after the top results are chosen can leave nothing.

## Hybrid search and reranking

- Similarity search misses exact terms: identifiers, product codes, names, rare words. Keyword search misses paraphrase. Run both and fuse the rankings when the questions include both kinds.
- Raw similarity order is noisy and returns near-duplicates. Retrieve a wider candidate set, then rerank or filter down to the passages that actually bear on the question before they reach the model.
- More context is not better. Each irrelevant passage costs tokens and gives the model something to be misled by. Cap per source so one long document cannot fill the context.
- Give the feature a way to say the evidence is insufficient: below a relevance floor, ask for more or answer that it does not know, instead of generating anyway.

## Evaluate retrieval apart from generation

Judge retrieval first; an answer cannot be better than its evidence. Follow [EVALS.md](EVALS.md) for the eval set and graders, with these additions:

- **Retrieval recall:** for questions with known relevant passages, how often those passages are in the final assembled context, not only in the candidate list.
- **Context precision:** how much of the assembled context is relevant.
- **Faithfulness:** whether each claim in the answer is supported by the retrieved passages.
- **Refusal:** questions the corpus cannot answer, where the right result is "not found".

Run the eval through the production path, including query construction, filtering, truncation, and the context budget. A benchmark that calls the search function directly proves little when production transforms the input first. Use production-shaped inputs, report results by slice (query type, language, tenant, source type), and for multi-topic inputs report recall per topic. Keep a versioned baseline and agree the allowed regression before changing chunking, embeddings, or ranking.

## Grounding and citations

Attribute a claim only to a passage that was retrieved and that supports it. Carry source identifiers through to the answer, and check in code that every cited identifier was in the context. A citation the model produced from memory is a defect. Where the stakes justify it, verify that the cited passage contains the claim, with a string check where possible and a model grader otherwise.

## Access control

Apply the caller's permissions at retrieval time, as a filter in the query, using attributes stored with each chunk. Do not retrieve everything and ask the model to withhold: whatever reaches the context can reach the answer. Keep tenants apart in the index or by a mandatory filter that code adds, never one the prompt requests. Deleting or restricting a document must remove or restrict its chunks, cached answers, and stored summaries. Use `security-review` for the audit.

## Freshness and re-indexing

Decide how stale an answer may be, then index to that: on change where the source can notify, on a schedule otherwise. Re-index incrementally by content hash and handle deletions, not only additions. Record when each chunk was indexed, and show the source date where age matters to the reader. Plan a full rebuild for a change of embedding model or chunking, built beside the live index and switched after the eval passes.

## Retrieved text is untrusted

A retrieved document may contain instructions aimed at the model. Mark retrieved passages as data in the prompt's structure, keep permissions and required actions in code, and validate any action the model proposes after reading them. A corpus that outsiders can write to, such as web pages, tickets, or uploads, needs this most.
