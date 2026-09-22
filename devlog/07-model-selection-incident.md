# 07 — Model Selection Incident (why gemini-3.5-flash-lite, not gemini-3.6-flash)

**Files touched:** `src/server/llm/client.ts` (default model), `.env.example`,
`src/server/llm/withRetry.ts` (retry condition widened)

## What happened
Before wiring the orchestrator, I ran a live sanity check of `extractRequirements()`
against the real Gemini API. It surfaced three real problems in sequence, each fixed
before moving on:

1. **`gemini-2.0-flash` (the original default) returned 404** — Google had retired it
   by the time of this build (2026), with the error message itself pointing at
   `gemini-3.6-flash` as the replacement.
2. **After switching to `gemini-3.6-flash`, calls intermittently 503'd** ("high
   demand"). Investigating why `withRetry` didn't already absorb this showed it only
   treated 429/rate-limit errors as retryable — a 503 fell through as non-transient
   and failed immediately. Fixed by widening the retryable-error match to also cover
   503/unavailable/overloaded (see entry 06).
3. **Running the actual batch command against `gemini-3.6-flash` failed all 3 test
   cases** with a 429 whose message revealed the real constraint:
   `quotaId: GenerateRequestsPerDayPerProjectPerModel-FreeTier, limit: 20`. That's 20
   requests **per day**, not per minute — no amount of backoff fixes a daily cap, and
   one kit alone needs 10-15+ calls (extraction + brief + per-requirement-per-category
   questions + flashcards).

## Why this matters / what I did
Queried the live `models.list` endpoint to see what was actually available, rather
than guessing model names from possibly-stale training knowledge. Picked
`gemini-3.5-flash-lite` — lite-tier models are built for high-volume, low-complexity
calls (exactly our pattern: many small structured-JSON generations per kit) and
carry a much more generous free daily quota than a newer, higher-capability preview
model like 3.6. Verified with a single probe call before touching the pipeline, then
re-ran the full batch command: **3/3 cases succeeded**, all validated against the Zod
schema, in ~4.5 minutes (well inside the 15-minute/5-case budget).

## Trade-off
- **`gemini-3.5-flash-lite` vs a higher-capability model:** lite models trade some
  reasoning quality for quota headroom and speed. For this pipeline's actual jobs —
  extracting explicit facts from a JD, writing short factual briefs, generating
  interview questions from a single requirement at a time — that's the right trade;
  none of these tasks need frontier-model reasoning depth, and the alternative (a
  bigger model that can't complete even 2 full kits/day on the free tier) fails the
  assessment's core "run this against unseen JDs" requirement outright.
- **This is exactly the scenario the brief warns about** ("free tiers limit tokens per
  minute, not just requests, and that limit is easy to hit") — worth stating directly
  in the README as a design decision made from real observed behavior, not
  theoretical caution.
