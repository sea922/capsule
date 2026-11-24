# Perimeter checks

Read when the review covers a deployed site or API and the question is what its public edge exposes. These checks read what any visitor can already request. They produce leads for the review, not a verdict on the application behind the edge.

## Safety contract

- **Authorization first.** Confirm that the user owns the target or is authorized to test it, and name the exact hosts in scope. A hostname found in code or documentation is not authorization. Prefer a staging host when one mirrors production.
- **Read-only requests.** Use `GET` and `HEAD` on public paths. Send no payloads meant to break, inject, or change state, and submit no forms.
- **Low volume.** A handful of bounded requests per check, with connect and total timeouts. No crawling, fuzzing, path wordlists, or parallel bursts.
- **No exploitation.** Stop at the signal that a weakness exists. Do not download an exposed repository, read an exposed secret, or replay a poisoned response to other users.
- **No credential guessing**, no login attempts, and no use of a credential found during the check.
- **Report signals, never values.** Record that a file matched its signature, not its contents. Keep captured responses in a private temporary directory and remove them afterwards.
- **Stay local.** Use the tools already on the machine. Sending the hostname to a third-party scanner is a separate decision for the user.

A check that needs more than this, such as an authenticated test or a live cache-poisoning attempt, requires its own authorization and belongs in an isolated environment.

## 1. Exposed files

Request each path directly and judge the body by its signature, since a blocked directory listing says nothing about the files under it.

| Path | Exposed when |
| --- | --- |
| `/.git/HEAD`, `/.git/config` | The response is `200` and looks like a ref line or a Git config section. The repository can then be rebuilt object by object even if `/.git/` itself returns `403`. |
| Environment files such as `/.env` | The response is `200` with `NAME=value` lines and is not an HTML page. |
| `/package.json`, lockfiles, `/.npmrc`, `/.yarnrc.yml`, `/composer.lock`, and similar manifests | The response is `200` with the file's own structure. A lockfile publishes the exact dependency tree; a registry config can carry a token. |
| `/docker-compose.yml`, backup and archive names next to the app | The response is `200` with the file's structure. |
| Source maps (`*.js.map`) beside production bundles | The map is served. It carries original sources and comments; whether that matters is the project's call, so report it as a lead with what it reveals. |

A single-page app often answers every unknown path with `200` and its HTML shell. Compare against a path that cannot exist before calling anything exposed.

## 2. Security headers from the real response

Read the headers the edge actually sends, on an HTML page and on an API route. A proxy or CDN can strip or override what the framework sets, so configuration files are not evidence.

- **Transport:** plain HTTP redirects to HTTPS, and HTTPS responses carry `Strict-Transport-Security` with a meaningful `max-age`. `includeSubDomains` and `preload` are deployment decisions: the first breaks any subdomain without HTTPS, and the second is slow to undo.
- **Content-Security-Policy:** present, with a default source, a script source, `object-src 'none'`, `base-uri`, and `frame-ancestors`. Flag `'unsafe-inline'` scripts unless nonces or hashes are in use, and flag `'unsafe-eval'` on its own, since nonces do not neutralise it.
- **Others:** `X-Content-Type-Options: nosniff`, a `Referrer-Policy`, a framing control (`frame-ancestors` or `X-Frame-Options`), and a `Permissions-Policy` where the product uses none of the powerful features.
- **Disclosure:** `Server`, `X-Powered-By`, and similar headers naming exact versions.

A missing header is a hardening gap. It becomes a finding only with the abuse path it would have blocked.

## 3. Cross-origin access

Send one request with an `Origin` header set to a domain that cannot exist. If the response echoes that origin in `Access-Control-Allow-Origin` together with `Access-Control-Allow-Credentials: true`, record a high-priority lead: any site could read that endpoint with the visitor's cookies. Whether it is a finding depends on whether the endpoint returns non-public data to a signed-in user, which the review confirms from the code or an authorized session. A wildcard origin without credentials on public data is usually intended.

## 4. Cache poisoning signals

A cache that ignores a request header the origin uses to build the response can serve one visitor's poisoned page to everyone. From the outside, look only for the signal:

- The response reflects a forwarded-host or forwarded-scheme header into a link, redirect, or script URL.
- The response is cacheable (`Cache-Control`, `Age`, or the CDN's cache-status header), and `Vary` does not list that header.

Sending such a header against a shared production cache key can poison it for real users. Do it only on an isolated staging host, or on a URL with a fresh random query parameter after showing that the cache keys on the query string, and only when the user has approved that probe. Otherwise report the reflection as a hypothesis and name the staging test that would settle it.

## 5. Cookies

For every `Set-Cookie` that carries a session or authentication value, record `Secure`, `HttpOnly`, `SameSite`, scope (`Domain`, `Path`), and lifetime. `SameSite=None` needs a reason, such as an intended cross-site embed, and a separate anti-forgery control. Flags describe the cookie only; they do not show that sessions expire or can be revoked.

## 6. TLS basics

Confirm a valid, unexpired certificate that matches the host and a complete chain, that outdated protocol versions are refused, and that HTTP redirects to HTTPS without first serving content. Use the TLS client already installed and check its options against the installed version. A full cipher audit belongs to a dedicated scanner the user chooses to run.

## 7. Error and disclosure surface

Request one path that cannot exist on the site and one on the API. The response should be a plain error without stack traces, file paths, query text, or framework and dependency names. Check for `/.well-known/security.txt` with a contact and an unexpired expiry, so a reporter knows where to send a finding.

## 8. Crawler boundaries

Read `/robots.txt`, and `/llms.txt` where the site publishes one. Record whether the paths the project means to keep out of search and AI crawlers are listed, and whether the file itself reveals private paths by naming them. These files are requests to well-behaved crawlers, not access control: anything listed there must also be protected by authentication. A user-agent string proves nothing about who is asking.

## What an edge check cannot prove

State these as unverified unless the review covered them by other means:

- **Authorization:** object-level access, tenant isolation, and privilege escalation need authenticated tests with more than one role.
- **Authentication and sessions:** password policy, multi-factor enforcement, token rotation, and server-side revocation.
- **Injection, request forgery from the server, and business-logic flaws:** these need the code or targeted testing.
- **Logging and alerting:** whether an attack would be recorded or noticed.
- **Anything behind a login**, on other hosts, or on internal networks.

A clean perimeter pass means these checks found nothing on the named hosts on that day. It is not evidence that the application is secure, and it maps to no compliance standard by itself.

## Reporting

Give each lead the host and path, the request made, the observed status and signal, and its bucket under the skill's rules: supported, hypothesis with the check that would settle it, or disproved. Include the list of what was not examined.
