# Technical Requirements Document (TRD)

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS | Already scaffolded in repo root |
| Backend | Next.js API routes (Route Handlers) under `src/app/api/*` OR a separate Express app under `server/` | Decision: **start with Next.js Route Handlers** to keep one deployable unit and satisfy "frontend and backend both reachable" trivially on one Vercel-style deploy; keep service layer framework-agnostic (see §4) so it can be lifted into Express later if needed. Document this choice in README as the "equivalent technology" substitution for Express. |
| Database | MongoDB Atlas (free tier) via Mongoose | Stores users, kits, sessions/practice progress |
| Auth | Custom session-based auth: bcrypt password hashing + signed HTTP-only cookie session (e.g. `iron-session` or a hand-rolled JWT-in-cookie) | No email verification / password reset — out of scope per brief |
| LLM Provider | Google Gemini (`gemini-1.5-flash` / `gemini-2.0-flash`) via `@google/genai`, free tier | Alternative: Groq (Llama 3.1) if Gemini quota is a problem. Final choice documented in README with model name. |
| Scraping/Crawling | `undici`/`fetch` + `cheerio` for HTML parsing and link extraction | No headless browser needed for static company sites; keep dependency footprint small |
| Public discussion search | A free-tier web search API (e.g. Tavily free tier, or Bing/Brave Search free tier) as an abstraction behind a `SearchProvider` interface | If no key available, degrade gracefully to "no public discussion found" rather than failing |
| Validation | `zod` | Validates API request bodies AND validates generated kit JSON against Appendix A schema before persistence |
| Testing | `vitest` + `@testing-library/react` (or Jest, TBD at implementation time) | Focus: schedule allocation, coverage checking, structure validation (explicitly called out in brief) |
| Rate limiting / retry | Custom token-bucket limiter + exponential backoff wrapper around all LLM and external HTTP calls | Free tiers throttle tokens/min, not just requests — must be handled or pipeline fails brief's core test |
| Deployment | Vercel (frontend + API routes) + MongoDB Atlas (DB) | Both free tier. If Express is chosen instead, backend deploys to Render/Railway free tier. |

## 2. Why Next.js Route Handlers over separate Express backend

The brief allows "equivalent technologies... if you explain the choice." Reasons:
- Single deploy target simplifies "frontend and backend must both be reachable" —
  same domain, no CORS complexity, one free-tier deployment to manage within the
  4-day window.
- The brief's *actual* backend requirement is separation of concerns in code
  (retrieval / extraction / generation / scheduling / persistence), not a specific
  HTTP framework. That separation is enforced at the **service-layer** level
  (`src/server/*`), independent of whether routes are Express or Next.js handlers.
- The batch entry point (`npm run evaluate`) calls the service layer directly as a
  Node script — it does not go through HTTP at all — so framework choice for the
  web layer doesn't affect batch-mode correctness.

If time permits and the reviewer strongly prefers literal Express, the service layer
is written such that swapping the HTTP layer to Express is a thin wrapper change, not
a rewrite.

## 3. Non-Functional Requirements

- **Reliability:** pipeline must survive a single unreachable source, a single LLM
  rate-limit event, or a single malformed LLM response without aborting the whole kit
  generation. Failures are recorded, not fatal.
- **Performance:** batch mode must complete 5 cases within 15 minutes including
  retries — implies bounded concurrency (e.g. 2-3 cases in parallel) and per-call
  timeouts.
- **Security:** SSRF protection on all user/JD-supplied and crawled URLs (block
  `localhost`/private ranges in production, allow in batch/dev mode since test company
  sites are served locally); size/content-type caps on fetched pages; strict prompt
  templates that quote untrusted content as data, never as instructions.
- **Data integrity:** every kit persisted must pass Zod validation against the exact
  Appendix A shape first.
- **Accessibility:** keyboard-navigable builder and practice mode; visible focus states.
- **Responsiveness:** usable on laptop and phone breakpoints (Tailwind responsive
  utilities).

## 4. Service Layer Architecture (framework-agnostic core)

```
src/server/
  retrieval/        fetchPage, robotsCheck, urlValidator (SSRF guard)
  crawler/           crawlCompanySite, rankLinks, findHiringPage
  search/            searchPublicDiscussion (provider-abstracted)
  extraction/        extractRequirements(jd) -> Requirement[]
  generation/        generateQuestions(requirement, category), generateBrief, generateFlashcards
  coverage/          checkCoverage(requirements, questions) -> gaps   // deterministic, no LLM
  scheduler/         buildSchedule(topics, days)                      // deterministic, no LLM
  pipeline/          orchestrator: runs the full sequence end-to-end, used by BOTH
                     the web app's kit-creation flow and the batch `evaluate` script
  llm/               provider client + rate-limit/backoff wrapper + JSON-repair/retry
  validation/         zod schemas mirroring Appendix A exactly
  persistence/        Mongoose models + repository functions
```

The `pipeline/orchestrator` is the single source of truth for "how research and
generation are sequenced" — both `src/app/api/kits/route.ts` (web) and
`scripts/evaluate.ts` (batch) call into it, satisfying the brief's "same code your
application uses, not a parallel implementation" requirement.

## 5. Generation State Model (edited/generated/pinned)

Each editable item (question, flashcard, brief field) carries metadata:

```ts
type EditState = "generated" | "edited" | "pinned";
```

- `generated`: produced by the LLM, safe to overwrite on regeneration of its section.
- `edited`: user modified it manually — survives regeneration of its parent section by
  default (excluded from the regenerate-and-replace set).
- `pinned`: user explicitly locked it — always survives, even bulk regenerations.

Regeneration of a section (e.g. "technical" question category) only replaces items in
that section whose state is `generated`; `edited`/`pinned` items are kept and merged
back in. Full design + rationale goes in README per brief's explicit ask.

## 6. Batch Entry Point

`scripts/evaluate.ts`, run via `npm run evaluate -- --input cases.json --output kits.json`.
- Reads env from `.env` (documented in `.env.example`).
- Calls `pipeline/orchestrator` per case with bounded concurrency.
- Wraps each case in try/catch; on failure writes `{status: "failed", kit: null, error}`.
- Writes single JSON per Appendix B shape.
- Must run from a clean clone: `npm install && npm run evaluate -- ...` only.

## 7. Testing Strategy

- Unit tests: `coverage/checkCoverage`, `scheduler/buildSchedule`, `validation` (Zod
  schema), URL/SSRF guard.
- Integration test: orchestrator against a mocked LLM + a local static "fake company
  site" fixture server (mirrors how Trao will test with `localhost` company URLs).
- No E2E browser tests required by brief, but manual QA pass before submission
  (loading/empty/error states, keyboard nav).

## 8. Environment Variables (draft — finalize in `.env.example`)

```
MONGODB_URI=
SESSION_SECRET=
LLM_PROVIDER=gemini
GEMINI_API_KEY=
SEARCH_PROVIDER=tavily
TAVILY_API_KEY=
NODE_ENV=development
ALLOW_LOCAL_URLS=true   # batch/dev only; false in production for SSRF safety
```
