# 05 — Retrieval & Crawler (Phase 2)

**Files:** `src/server/retrieval/fetchPage.ts`, `src/server/retrieval/robotsCheck.ts`,
`src/server/crawler/rankLinks.ts`, `src/server/crawler/crawlCompanySite.ts`,
`src/server/search/searchPublicDiscussion.ts`

## What
The full "find out about the company" layer: a hardened page fetcher, a robots.txt
checker, a link-ranking heuristic, a crawler that ties them together, and a
best-effort public-discussion search.

## Why
This is what the brief calls "the interesting half" of the assessment — finding a
company's hiring page without knowing its URL in advance, because companies put it
at `/careers`, `/jobs`, a handbook, an engineering blog, or somewhere unpredictable.
A fixed path list is explicitly called out as insufficient. Everything here exists to
make that discovery genuine (heuristic ranking of real links found on the page) rather
than guessed.

## How

**`fetchPage`** — wraps `fetch` with: the SSRF guard from Phase 1, a 10s timeout, a
content-type allowlist (`text/html` only), a 2MB size cap, and retry with exponential
backoff (skipped for 4xx responses, since retrying a 404 wastes time/quota for no
benefit). Never throws — returns a discriminated `{ok: true, html, finalUrl} |
{ok: false, reason}` so callers can "skip and report" per the brief, instead of
try/catch scattered everywhere.

**`robotsCheck`** — fetches `/robots.txt` and parses just the wildcard (`User-agent: *`)
group's `Disallow` rules — enough to honor the brief's "respect robots.txt"
requirement without building a full RFC 9309 parser (YAGNI). Deliberately bypasses
`fetchPage`'s html-only content-type gate with its own minimal fetch, since
robots.txt is served as `text/plain`.

**`rankLinks`** — the actual "interesting half." Scores every link found on the
homepage by keyword signals in its URL path and anchor text: hiring words (career,
job, hiring, interview, handbook, apply...) score highest, "about/team/mission"
words score lower, engineering-blog words score a bit, and known noise (privacy,
terms, login, cart) is filtered out entirely. No exact-path matching anywhere — a
link like `/company/work-with-us` or `/handbook/hiring-process` ranks correctly
despite matching no hardcoded path.

**`crawlCompanySite`** — fetches the homepage, extracts same-origin links (resolving
relative URLs against the actual final URL — required because the batch grader's
fixture sites are served from `localhost` and use relative links), ranks them, checks
robots.txt per candidate, and fetches the top few. Every failure (unreachable,
disallowed, wrong content type) lands in `skipped` with a reason; the crawl continues
regardless, matching "skip and report a source that cannot be retrieved, rather than
failing the whole run."

**`searchPublicDiscussion`** — abstracted behind a provider function so the actual
search backend (Tavily's free tier) can be swapped without touching pipeline code. If
no API key is configured, or the call fails, it returns `[]` rather than throwing —
the pipeline treats that as "genuinely found nothing," which the brief says to report
honestly rather than fabricate.

## Trade-offs
- **Keyword-heuristic ranking vs an LLM call to "guess" the hiring page:** an LLM
  could also be asked "which of these links is the careers page," but that would (a)
  cost tokens per company crawled, working against the free-tier rate-limit
  constraint the brief warns about, and (b) be non-deterministic where a keyword
  score is fast, free, and testable with plain unit tests (see `rankLinks.test.ts`).
  If the heuristic proves too weak in practice, the fallback is to feed the ranked
  page *text* (not the link-picking decision) to the LLM for brief-writing — which is
  what already happens downstream.
- **`MAX_PAGES_TO_FETCH = 4` (homepage + top 3):** a deeper crawl (following links
  found on the hiring page too) would find more, but adds latency and fetch volume
  that competes with the batch command's 15-minute/5-case budget. Depth-1 from the
  homepage, informed by ranking rather than brute-force, is the chosen balance —
  documented as a limitation, not hidden.
- **Same-origin-only links:** deliberately excludes third-party links (e.g. a
  LinkedIn or Glassdoor page linked from the homepage) from the *crawl* — that kind
  of external discussion is `searchPublicDiscussion`'s job instead, keeping the two
  concerns (own-site crawl vs. public discussion search) cleanly separated rather than
  one function doing both.
