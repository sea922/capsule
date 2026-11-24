---
name: seo
description: Audit and improve how a web product is found in search, from what a crawler actually receives, covering crawling, indexing, on-page signals, structured data, and rendering for crawlers. Use when asked for an SEO audit or fix, when a page is missing from results or search traffic dropped, when adding schema markup, sitemap, or robots rules, or before launching pages meant to be found. Making pages faster belongs to performance; WCAG conformance to accessibility; visual finish to interface-polish.
---

# SEO

Most pages that fail in search are not outranked; they were never eligible. They are blocked, not indexed, split across several URLs, or built for a query nobody asks with that intent. Establish eligibility from what a crawler receives, fix blockers before refinements, and never report a state you did not observe.

Keep five states apart: published, crawlable, indexed, ranking for a query, and earning clicks. Each is checked differently, and each can fail while the one before it holds. "The page is live" describes only the first.

## 1. Scope the surface and the goal

Name the pages or templates in scope and what each is for. For a page meant to be found, write the query it should answer and the intent behind it as one sentence about what the searcher wants next. Where the results for that query can be read, read them: what already ranks shows the format the engine has settled on. When they cannot be read, mark the intent as assumed.

Read how the site produces its pages: framework, rendering mode per route, where titles, canonicals, robots rules, and the sitemap are generated, and which routes are meant to stay out of search. Ask which search console or analytics data is available.

**Complete when:** the pages, their intended queries, the rendering mode, and the available data are named, with assumptions marked.

## 2. Audit what a crawler receives

Work from the deployed or locally served site, not from the source alone. Fetch each sampled URL without running scripts and record what came back, following [references/CHECKS.md](references/CHECKS.md):

- **Reachability:** final status code, redirect hops, and whether `robots.txt` allows the path.
- **Indexability:** `noindex` in markup or response headers, the canonical and where it points, and alternate-language links where the site has locales.
- **Discovery:** presence in the sitemap, and a plain link to the page from a page already in the index.
- **Content in the response:** title, description, one main heading, heading order, main content, and internal links present before any client-side rendering.
- **Structured data:** types present, whether they parse, and whether they describe what the page visibly shows.
- **Duplicates:** several URLs serving the same content, and pages of the site competing for one intent.

Sample every template rather than every URL: one defect in a template repeats on every page it builds. A value read from source code is a prediction; a value read from the response is evidence. Say which each finding rests on.

**Complete when:** each check has a recorded value for each sampled template, and anything that could not be observed is listed.

## 3. Rank the findings

Order by how many pages a finding affects and which state it blocks:

1. **Blocks crawling or indexing:** disallowed paths, stray `noindex`, canonicals pointing elsewhere, error or soft-error responses, content missing from the response.
2. **Splits or misdirects signals:** duplicate URLs, redirect chains, inconsistent host or trailing-slash forms, pages competing for one intent, orphan pages.
3. **Weakens how the result reads:** duplicate or default titles, missing descriptions, heading structure that hides the subject, invalid structured data.
4. **Refinements:** wording, extra markup types, link anchor text.

Give each finding its location, the observed value, the consequence, and a scoped fix. Treat page-experience measures such as Core Web Vitals as one ranking input among many: record whether field data shows a problem and hand the work to `performance`. Search engines revise their guidance and thresholds, so cite the engine's current documentation for any limit instead of stating one from memory.

**Complete when:** findings are ordered by blocked state and reach, each with evidence and a fix.

## 4. Fix at the source

Change the template, layout, or generator that produces the value, so every page it builds is corrected at once. Defaults that yield to the project's conventions:

- one preferred URL form, with a self-referencing absolute canonical and redirects from the other forms in a single hop
- a title and description generated per page from its real subject, written to be chosen from a list of results
- one main heading naming the subject, with subheadings in order
- main content and navigation links in the server response for pages meant to be indexed
- a sitemap built from the same source as the routes, listing only indexable, canonical URLs
- structured data only for a type that truly applies, generated from the same data the page displays
- internal links from related, indexed pages, with anchor text that describes the destination

Stop and ask before any change that can remove traffic: editing `robots.txt`, adding `noindex`, changing a canonical, adding or changing redirects, or merging and deleting live URLs. Show the current value and the proposed one, with any interaction between the changes. When the user asked for that exact change, show these first, then proceed; otherwise wait for confirmation. Decline tactics that no longer help or carry penalty risk, such as keyword repetition, thin pages per keyword variant, hidden text, or markup for content that is not on the page, and say why.

Keep content work brief here: one primary intent per URL, no two pages chasing the same one, and the answer near the top. Writing the copy belongs to `writing-for-humans`.

**Complete when:** each accepted fix is made where the value is generated, and risky changes are proposed with before and after values.

## 5. Verify from the rendered output

Fetch the changed pages again the same way and compare with the recorded values: status, robots, canonical, title, description, headings, links, and structured data parsed by a validator. Follow each redirect to confirm one hop. Check the sitemap parses and lists the canonical forms. Add a test or build check for values a template can silently lose.

Indexing and ranking arrive later than the work. Confirm them only from the engine's own console, with the query, URL, and date range, and compare windows long enough to outlast daily variation.

**Complete when:** every fix is confirmed in the response, and later states are reported as unobserved or backed by console data.

## Report

List the pages and queries in scope; each finding with its observed value, the fix, and the value after; changes proposed but not made; and the states not observed. Promise eligibility that was verified, never a ranking.

## Boundaries

`performance` owns measuring and improving speed and layout stability. `accessibility` owns WCAG conformance, though correct headings, link text, and image alternatives serve both. `interface-polish` owns visual finish. `i18n-sync` owns the locale files behind translated pages. `ship-it` owns releasing the change.
