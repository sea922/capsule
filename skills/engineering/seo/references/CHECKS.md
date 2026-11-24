# Search eligibility checks

Read when auditing a page or template. Record the value each check returned,
not a tick. Search engines change their limits and supported features; confirm
anything numeric or feature-specific against the engine's current
documentation.

## How to look

- Request the URL with a plain HTTP client and read the raw response. Content
  that appears only after scripts run is content a crawler may not see, or may
  see late.
- Follow redirects one hop at a time and record each status and target.
- Check both the response headers and the markup: robots directives and
  canonicals can be set in either, and the two can disagree.
- Repeat with the forms of the URL that should not be canonical: other host,
  other scheme, with and without trailing slash, with tracking parameters.

## Reachability

| Check | Healthy | Common defect |
| --- | --- | --- |
| Status of the final URL | Success for a real page, a true not-found for a missing one | A missing page that answers with success and an error message |
| Redirects | One hop, permanent, to the canonical form | Chains, loops, temporary redirects left in place |
| `robots.txt` | Reachable, allows indexable paths and the assets they need | A rule left over from a staging site that disallows everything |
| Assets | Scripts and styles needed to render are crawlable | Blocked asset paths that leave the rendered page empty |

## Indexability

| Check | Healthy | Common defect |
| --- | --- | --- |
| Robots directive | Absent or permissive on indexable pages | `noindex` inherited from a shared layout or an environment flag |
| Canonical | One, absolute, pointing at the page's own preferred URL | Missing, relative, several, or every page pointing at the home page |
| Blocked and `noindex` together | Not combined | A disallowed page whose `noindex` can never be read |
| Language alternates | Each locale lists the others and itself, with matching return links | One-way links, or codes that do not match the served language |
| Pagination and filters | Deliberate rule for which variants are indexable | Unbounded parameter combinations each indexable |

## Discovery

- The sitemap is reachable, parses, is referenced from `robots.txt`, and lists
  only canonical, indexable, successful URLs.
- Every indexable page has at least one plain anchor link from another
  indexable page. Links built only by script handlers are not links.
- Important pages are a few links from the home page, not buried.

## On the page

| Element | Look for |
| --- | --- |
| Title | Present in the response, unique per page, names the subject first; not a site-wide default |
| Description | Present, honest, specific to the page; engines may rewrite it |
| Headings | One main heading that names the subject; subheadings in order, chosen for meaning and not for size |
| Main content | In the response, not only after hydration; not duplicated from another URL |
| Images | Alternative text that describes the image; dimensions set so layout does not shift |
| Links | Descriptive anchor text; no "click here" where the destination can be named |
| Social preview | Title, description, and image tags present where sharing matters |

## Structured data

- Use a type only when the page is that thing: an article, a product with an
  offer, a breadcrumb trail, an organization, a question page.
- Every marked-up value must match what the page shows and be generated from
  the same data.
- Validate that it parses and carries the required properties with the
  engine's own testing tool. Eligibility for a rich result is decided by the
  engine and changes; markup never guarantees one.

## Rendering strategy

| Mode | Risk for search |
| --- | --- |
| Server-rendered or static | Lowest; confirm the response holds the content |
| Client-rendered | Content and links depend on the crawler running scripts; confirm what the raw response holds and prefer server output for pages meant to rank |
| Hybrid or streamed | Check that metadata is in the first response and that late content is not the main content |

Check also that the mobile response carries the same content and markup as the
desktop one, since the major engines primarily index the mobile version; confirm for the
engine that matters.

## Reading a traffic drop

Separate the candidates before explaining:

- fewer impressions: demand changed, or the page lost visibility or left the index
- steady impressions, fewer clicks: the title or description changed, or a results feature now takes the click
- a whole section fell at once: a template, robots, canonical, or redirect change shipped; compare with the deploy history
