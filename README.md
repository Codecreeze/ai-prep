# AI Interview Prep Kit

A web app that turns a pasted job description + a company URL into a personalised,
editable interview prep kit — company brief, role breakdown, categorised question
bank, flashcards, and a day-by-day study schedule — built by a multi-step research
and generation pipeline, not a single prompt.

Built for the Trao Full-Stack Engineering Assessment (`FS-AI-INTERVIEW-01`).

- **Live app:** _[add deployed URL here]_
- **Walkthrough video:** _[add video link here]_

---

## 1. Overview & Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 | Matches the brief's preferred stack. App Router gives server-side auth gating with no client-side flash of protected content. |
| State | Redux Toolkit + RTK Query | Single store: RTK Query owns all server-cache state (kits, practice data), a small `uiSlice` owns cross-tree client state (sidebar collapse, watched-kit ids, completion notices). Chosen over React Query/Zustand for one predictable data-flow pattern instead of two. |
| Backend | Next.js Route Handlers (`src/app/api/**`) | Equivalent to Node.js + Express per the brief's "equivalent technologies are acceptable" clause — same Node runtime, same separation of concerns, without running two servers/deployments for a project this size. Every route is a thin adapter over the service layer in `src/server/**`; no business logic lives in a route handler. |
| Database | MongoDB Atlas + Mongoose | Matches the brief. One `Kit` document per kit (source, brief, role, questions, flashcards, schedule, coverage, editState) — the whole kit is one aggregate that's read/written together, so a single document maps naturally to it. |
| LLM | Google Gemini (`gemini-3.5-flash-lite`, free tier) | Genuine free tier, generous-enough per-minute quota for iterative multi-call generation. (`gemini-3.6-flash` was tried first and rejected — see §3, it turned out to have a 20-requests-**per-day** free quota, not per-minute, which is unworkable for a multi-call pipeline.) |
| Search | Tavily (free tier), optional | Used for the public-discussion-of-interview-process step. Gracefully degrades to "nothing found" if `TAVILY_API_KEY` isn't set, rather than failing the pipeline. |
| Scraping | `fetch` + `cheerio` | No headless browser needed — company marketing/careers pages are static HTML; cheerio is enough to strip nav/footer/script and extract link + text content. |
| Testing | Vitest | Fast, native ESM/TS support, no extra config over Jest for this project's needs. |

---

## 2. Setup

### Local development

```bash
npm install
cp .env.example .env.local   # fill in real values, see §9 for what each one is for
npm run dev
```

Open `http://localhost:3000`. Register an account, then use the Analyze page.

### Full validation (lint + typecheck + tests + production build, one command)

```bash
npm run check
```

### Batch entry point (mandatory command, Section 9 of the brief)

```bash
npm run evaluate -- --input cases.json --output kits.json
```

- Reads an array of `{ id, jd, company_url, days }` cases (Appendix A/B shape).
- Runs the **exact same pipeline function** (`src/server/pipeline/orchestrator.ts`)
  the web app's kit-creation route calls — not a parallel implementation.
- Continues past a failed case instead of aborting the run; each result is recorded
  as `{ id, status: "ok" | "failed", kit, error }`.
- Writes one JSON file in the exact Appendix B shape (`{ version, generated_at, kits }`).
- Verified against a 5-case sample (including 1-day and 60-day schedules) run
  through a local fixture company site: 5/5 `ok`, ~2m22s total — comfortably inside
  the 15-minute/5-case budget.
- The company URLs used with this command may point at `localhost` (per Appendix B's
  own example) — set `ALLOW_LOCAL_URLS=true` for this (already the `.env.example`
  default for local/dev use). **This must be `false`/unset in production** — see §9.

### Deployed

- Frontend + backend are one Next.js deployment (Vercel).
- Database: MongoDB Atlas (a free M0 cluster), IP-allow-listed to Vercel or opened
  to `0.0.0.0/0` per Atlas's own guidance for serverless deployments with dynamic
  egress IPs.
- Environment variables set in the Vercel project dashboard — see §9 for the full
  list and what each one is for. `ALLOW_LOCAL_URLS` is **not** set in production
  (defaults to disabled), so the SSRF guard actually rejects private/loopback
  addresses there, unlike in local/batch dev mode.

---

## 3. LLM Provider and Model

**Google Gemini**, model `gemini-3.5-flash-lite` (overridable via `GEMINI_MODEL`).

`gemini-3.6-flash` was the original choice but was caught during a live sanity
test (before the batch run, not after — see `devlog/07`) to have a free-tier quota
of only **20 requests per day**, not per minute. A single kit generation makes on
the order of 10+ LLM calls (extraction, brief, one call per requirement×category
for questions, flashcards, and any second-pass gap-fill calls), so 20/day would
have made even manual testing impractical. Switched to `gemini-3.5-flash-lite`,
which has a workable per-minute free-tier quota.

**Rate-limit handling:** a token-bucket limiter (`LLM_REQUESTS_PER_MINUTE`, default
10) throttles outgoing calls client-side before they're even sent, and every call
is wrapped in `withRetry` — exponential backoff on 429 (rate-limited) and 503
(briefly unavailable) responses, so a provider saying "slow down" degrades to a
slower pipeline, not a failed one.

---

## 4. High-Level Architecture

```
Browser (Next.js App Router UI, Redux Toolkit + RTK Query)
        │ fetch (same-origin)
        ▼
Next.js Route Handlers — src/app/api/**
  auth/  kits/  kits/[id]/practice/  kits/[id]/regenerate/  kits/[id]/questions/  kits/[id]/flashcards/
        │ calls (never re-implemented, only imported)
        ▼
Service layer — src/server/**
  retrieval/  crawler/  search/  extraction/  generation/  coverage/
  scheduler/  pipeline/  llm/  validation/  builder/  practice/  persistence/  auth/  http/
        │                                   │
        ▼                                   ▼
  MongoDB Atlas (users, kits)      External services (Gemini, Tavily, company websites)

scripts/evaluate.ts (the batch CLI) calls src/server/pipeline/orchestrator.ts
directly — no HTTP hop — so it exercises the exact same code as the web app.
```

Each folder under `src/server/` is a single concern with no cross-imports outside
its own responsibility: `retrieval`/`crawler`/`search` only fetch and clean data,
`extraction`/`generation` only call the LLM, `coverage`/`scheduler` are pure
deterministic functions with no I/O, `pipeline` is the only place that sequences
them together, and `persistence`/`builder`/`practice` own everything Mongo-shaped.

**Frontend structure:** `src/app/dashboard/{analyze,kits,practice,analytics}` are
the four top-level routes (a real admin-dashboard shell — collapsible sidebar,
topbar, mobile drawer, command palette). `src/components/{kits,practice,nav,ui,
auth,theme}` mirror that by feature area. `src/lib/api/*` are RTK Query slices (one
per backend resource); `src/lib/uiSlice.ts` is the one piece of plain client state
that doesn't belong to a server resource.

---

## 5. Retrieval Approach and Sources Used

- **Company site crawl** (`src/server/crawler/crawlCompanySite.ts`): fetches the
  homepage, extracts every link, and **ranks them heuristically** — keyword/path
  signals (`careers`, `jobs`, `hiring`, `handbook`, `engineering`/`blog`, `culture`,
  `team`, `about`) score a link's likelihood of being a hiring or about page. The
  top-ranked candidates are fetched and their text cleaned (`cheerio`, stripping
  nav/footer/script/style). **No hard-coded path list** — this was deliberately
  tested against companies with hiring content in genuinely unpredictable places
  (per the brief's own GitLab/PostHog example) rather than assuming `/careers`.
- **robots.txt**: checked before crawling any path beyond the homepage
  (`src/server/retrieval/robotsCheck.ts`); a disallowed path is skipped, not
  fetched.
- **Public discussion of the interview process**: Tavily's search API
  (`src/server/search/searchPublicDiscussion.ts`), querying `"{company} interview
  process questions experience"`. Best-effort and provider-abstracted (swapping
  providers means changing one function, not the pipeline); an unconfigured key or
  a failed search both resolve to an empty result, treated honestly as "nothing
  found" rather than fabricating content.
- **Unreachable/unusable sources**: recorded and skipped (404, timeout, wrong
  content-type, oversized response), never aborting the whole run — the resulting
  kit's `source.pages_used` reflects only what was actually usable.

---

## 6. Research/Generation Sequencing — What Each Step Does

The pipeline (`src/server/pipeline/orchestrator.ts`) runs as a genuine sequence of
steps that respond to what was actually found, not one prompt returning everything:

1. **`extractRequirements(jd)`** — LLM call. Pulls structured requirements out of
   the pasted JD text only (no retrieval needed here — it's already text).
2. **`crawlCompanySite(companyUrl)`** — runs in parallel with step 1 (independent
   inputs). Ranks and fetches candidate pages as described in §5.
3. **`searchPublicDiscussion(companyName)`** — runs after the crawl (needs the
   company name derived from the URL).
4. **`generateBrief(pages, discussion)`** — LLM call, informed by whatever pages
   and discussion were actually retrieved (an honestly thin brief if little was
   found, not a fabricated one).
5. **`generateQuestionsFor(requirement, category, ...)`** — **one LLM call per
   (requirement × category) pair**, not one call for the whole bank. A requirement
   like "5+ years with React" and one like "mentoring junior engineers" route to
   different categories (`src/server/generation/categoryRouter.ts`) and get
   different prompts/instructions — a technical requirement should not produce
   behavioural questions from the same generic call, and vice versa.
6. **`generateFlashcards(questions)`** — LLM call, derived from the finished
   question bank.
7. **`checkCoverage(requirements, questions)`** — **deterministic, no LLM call.**
   Every requirement with no question referencing its id is a gap.
8. **Second pass**: for each gap, generate one more question in that requirement's
   primary category, then re-check coverage. Stops after `MAX_COVERAGE_PASSES = 2`
   total passes (see §7) — any requirement still uncovered is recorded honestly in
   `coverage.uncovered_requirement_ids`, not silently dropped.
9. **`buildSchedule(requirements, questions, days)`** — **deterministic, no LLM
   call.** Allocation is arithmetic (see §8).
10. **`validateKit(kit)`** — Zod schema validation against the exact Appendix A
    shape before the kit is ever persisted or returned.

The two steps the brief specifically forbids handing to the model — coverage
checking and schedule allocation — are pure, side-effect-free TypeScript functions
with their own dedicated unit tests (`tests/checkCoverage.test.ts`,
`tests/buildSchedule.test.ts`), not prompts.

---

## 7. The Second Pass (Coverage Loop)

`MAX_COVERAGE_PASSES = 2`: one initial generation pass, and — if `checkCoverage`
finds any uncovered requirement — exactly one gap-fill pass that generates
questions only for the still-uncovered requirements, then checks again.

**Why 2, not more:** the brief's own scoring criterion is "every must-have
requirement has a question," not "every requirement is covered no matter how many
retries it takes." A requirement that's still uncovered after a targeted second
pass is very likely either mis-extracted or genuinely hard to phrase a question
for — retrying it a third or fourth time burns LLM quota for diminishing returns,
and free-tier rate limits are exactly the failure mode the brief warns about most.
Two passes is the point where "the pipeline forces a loop rather than a single
shot" (the brief's actual requirement) is satisfied without turning an edge case
into an unbounded retry loop. Anything still uncovered after pass 2 is recorded
honestly in `coverage.uncovered_requirement_ids` rather than hidden.

---

## 8. The Builder — Generated / Edited / Pinned State

This was the brief's explicitly named "hardest state problem," and the one I spent
the most design time on.

Every editable item (a question, a flashcard, the company brief) carries an
**edit-state tag** stored separately from the kit's generated content
(`editState.questions[id]`, `editState.flashcards[id]`, `editState.brief`,
each `undefined | "edited" | "pinned"`):

- **`undefined` (generated, untouched)** — safe to silently replace on a
  regeneration of its category/section.
- **`"edited"`** — the user changed its text by hand. Survives a regeneration of
  its category: the regenerate endpoint only replaces items whose edit-state is
  still `undefined`, and generates new items only for requirements that still need
  coverage in that category.
- **`"pinned"`** — explicitly protected by the user (e.g. "I like this brief,
  don't touch it even if I ask for a regenerate"), same survival guarantee as
  edited but expressing user *intent* rather than an incidental edit.

**Why a separate map instead of an `edited: boolean` flag on each item:** a flag on
the item itself would get lost the moment an item is *replaced* by regeneration
(you'd need to carry it across the replace, which is exactly the bug this design
avoids) — keeping edit-state as its own keyed-by-id map means the regeneration
function's job is simply "never touch an id present as edited/pinned in this map,"
independent of whatever content transformation the LLM call itself does.

**Regeneration algorithm** (`src/server/builder/regenerateQuestionsCategory.ts`,
unit-tested with a mocked LLM so the test is deterministic): for a given category,
partition the category's current questions into kept (edited/pinned) vs
regeneratable; determine which requirements the kept set already covers within
that category; generate fresh questions only for the requirements still needing
coverage; merge kept + fresh. **Live-verified in the browser**: hand-edited a
question, regenerated its category, and the edited question's exact text survived
while the rest of the category refreshed.

`regenerateBrief` additionally requires an explicit `force: true` confirmation if
the brief is currently `edited`, since overwriting free-text prose the user wrote
is a more destructive action than replacing a generated question.

---

## 9. Environment Variables

See `.env.example` for the canonical list with inline comments. Summary:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (non-SRV form — see known limitations, §12). |
| `SESSION_SECRET` | Signing secret for the JWT session cookie. |
| `GEMINI_API_KEY` | Google Gemini API key (free tier). |
| `GEMINI_MODEL` | Model override; defaults to `gemini-3.5-flash-lite`. |
| `LLM_REQUESTS_PER_MINUTE` | Token-bucket limiter rate for outgoing LLM calls; default 10. |
| `TAVILY_API_KEY` | Optional. Public-discussion search; omitted → that step returns "nothing found" instead of failing. |
| `NODE_ENV` | Standard Node env flag. |
| `ALLOW_LOCAL_URLS` | **Must be unset/`false` in production.** This is the one flag that gates the SSRF guard (`src/server/retrieval/urlValidator.ts`): when `"true"`, private/loopback/link-local addresses are allowed — needed for local dev and the batch `evaluate` command, since Appendix B's own example company URL is a `localhost` address the grader's harness serves fixture sites from. When unset, the guard rejects `localhost` and private/loopback/link-local addresses outright. |

---

## 10. How the Schedule Is Allocated

`src/server/scheduler/buildSchedule.ts` — pure, deterministic, no LLM call:

1. Always produces exactly `days` day-entries (the brief's exact requirement:
   "the number of days in the schedule equals the number of days requested" — 1
   through 60, tested at both extremes).
2. Sorts questions by priority (`must` before `nice`) and difficulty (harder
   first) so higher-value, harder material is scheduled toward the **front** of
   the available days, not crammed the night before.
3. Slices that sorted, front-loaded order into `days` contiguous buckets (day 1
   gets the first/hardest slice, day 2 the next, and so on), so every `must`-
   priority requirement's question(s) land in the schedule and cluster toward the
   earlier days rather than being scattered evenly or crammed at the end.
4. Each day gets an integer `minutes` duration (never a float, never "about an
   hour," per the brief's exact structural requirement) computed from its
   question count and average difficulty.

---

## 11. Creative Feature — Readiness Score

**What it is:** a weighted score (0–100%, overall and per-requirement) shown on
the Practice page and a dedicated Practice hub, combining two signals that
otherwise live in separate parts of the app: whether a requirement has a question
at all (coverage) and how confident the user has felt practising the flashcards
tied to that requirement (practice history) — weighted toward `must`-priority
requirements.

**Why this and not just a display of existing numbers:** coverage alone says
"a question exists" but says nothing about whether the user is actually ready for
it, and practice confidence alone says nothing about whether the *right* material
was even generated. Neither number alone answers "am I ready?" — the synthesis of
both does. It's genuinely computed (`src/server/practice/readinessScore.ts`, unit
tested with 7 cases covering partial coverage, partial practice, and combinations
of both), not a static field copied from elsewhere.

**Problem it solves:** turns "here's your kit" into an actual answer to the
question a candidate preparing for an interview is really asking — *what should I
still work on, and how close am I* — surfaced as a ranked "focus areas" list of
the weakest-covered requirements, not just a raw percentage.

---

## 12. Key Design Decisions, Trade-offs, and Known Limitations

- **In-process async generation, not a job queue.** Kit generation (60–90s, several
  LLM calls) runs via Next.js's `after()` rather than a bare unawaited promise
  (which Next.js can kill once the response is sent) or a separate worker/queue
  service. This is a deliberate scope cut for a free-tier, single-evaluator-scale
  deployment — a real production system with concurrent load would need a durable
  queue (a crash mid-generation here loses that generation's progress, though the
  kit record itself persists as `"failed"` rather than hanging forever).
- **Route handlers instead of a separate Express server.** Chosen for one
  deployment instead of two, while keeping the same separation of concerns the
  brief asks for — every route is a thin adapter over `src/server/**`, never
  business logic inline in a handler.
- **Non-SRV MongoDB connection string.** A real bug hit during development:
  `mongodb+srv://` URIs failed to resolve on the development machine because the
  MongoDB driver's internal DNS resolver doesn't inherit custom DNS server
  settings. Worked around by using the equivalent standard (non-SRV) connection
  string. Documented here since it's exactly the kind of environment-specific gotcha
  a reader would otherwise lose time rediscovering.
- **Client-side pagination page sizes differ by list** (Kits table: 10/page with
  numbered pagination; Practice hub: 30/batch with infinite scroll) — a deliberate
  UX choice per list, not an inconsistency: the Kits table is a record you might
  jump around in by page number, the Practice hub is a "keep scrolling until you
  find what you want to practice" list.
- **Known limitation — no drag-and-drop reordering.** Questions reorder via
  explicit up/down move controls, not drag-and-drop. Functionally equivalent and
  fully keyboard-operable, but a drag interaction was cut as lower-value than the
  edit-preserving regeneration work.
- **Known limitation — single LLM provider, no fallback provider.** If Gemini's
  free tier has an outage, the pipeline retries with backoff but does not fail
  over to a second provider. Explicitly out of scope for a free-tier assessment
  project, called out here rather than left undocumented.
- **Preparing more than one role.** Both paths the brief allows are supported: the
  Analyze page stays open after submitting so you can paste and queue another kit
  immediately, and a separate "Upload cases file" control accepts a JSON array of
  `{ jd, company_url, days }` pairs — the same shape the batch `evaluate` CLI's
  `cases.json` uses — and queues each one as its own kit, sequentially (so it
  doesn't burst the LLM rate limiter with N simultaneous generations).

---

## Testing

```bash
npm run test        # 81 tests, vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run check         # all of the above + a production build, one command
```

Automated tests specifically cover the behaviour the brief names as most worth
protecting: schedule allocation (`tests/buildSchedule.test.ts`), coverage checking
(`tests/checkCoverage.test.ts`), and kit structure validation
(`tests/kitSchema.test.ts`) — plus the builder's edit-preserving regeneration logic,
the crawler's link-ranking heuristic, the SSRF URL validator, and every deterministic
piece of the practice-mode scoring.

## Development log

Every feature/change has a matching entry in [`devlog/`](devlog/README.md) — 30
entries covering what was built, why, how, and what trade-offs were made, written
alongside the code rather than reconstructed afterward.
