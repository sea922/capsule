# SEO

Use `seo` to audit and improve how a web product is found in search.

Examples:

- “Run an SEO audit on the marketing site.”
- “Why isn't this page in Google?”
- “Search traffic to the docs dropped last week.”
- “Add structured data to the product pages.”
- “Set up the sitemap and robots rules before launch.”

The skill keeps five states apart: published, crawlable, indexed, ranking, and earning clicks. It names the pages and the queries they should answer, then fetches sampled pages the way a crawler does and records what came back: status and redirects, robots rules, canonicals, the sitemap, titles and descriptions, headings, the content and links present before any script runs, and structured data. Findings are ranked by which state they block and how many pages they affect, and fixed in the template or generator that produces the value.

Changes that can remove traffic, such as robots rules, `noindex`, canonicals, and redirects, are proposed with before and after values. Every fix is verified from the response. The skill promises eligibility it verified, never a ranking, and points to the search engines' current documentation for limits that change.

## Workflow fit

`performance` owns speed and layout stability, which this skill records only as a ranking input. `accessibility` owns WCAG conformance, `interface-polish` visual finish, and `writing-for-humans` the copy.

See the [workflow map](../workflow.md), the [source research](../research/2026-11-24-ecc-decisions-build.md), and the [skill instructions](../../skills/engineering/seo/SKILL.md).
