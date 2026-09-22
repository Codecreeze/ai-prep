# 04 — Phase 1 Unit Tests

**Files:** `vitest.config.ts`, `tests/checkCoverage.test.ts`, `tests/buildSchedule.test.ts`,
`tests/kitSchema.test.ts`, `tests/urlValidator.test.ts`

## What
24 unit tests covering the four Phase 1 modules, run via `npm test`. All passing.

## Why
The brief names three specific behaviors as needing automated tests: "schedule
allocation, coverage checking and structure validation." These, plus the SSRF guard
(a security-critical pure function, cheap to test in isolation), are exactly the
pieces that are pure/deterministic — no LLM, no network, no DB — so they're the
highest-value, lowest-cost things to test first, before anything that needs mocking.

## How
- `checkCoverage`: must-have-covered, must-have-uncovered, nice-to-have-ignored,
  one-question-covers-many-requirements, and empty-questions-array cases.
- `buildSchedule`: correct day count, must-haves present somewhere in the schedule,
  every `question_ids` entry references a real question, `minutes` always an integer,
  the 1-day and 60-day edge cases from the brief don't crash, and harder/must-have
  material actually lands on day 1 (asserts the sort-then-bucket logic works, not
  just that it doesn't throw).
- `validateKit`: accepts a valid kit, rejects a missing field, rejects a float
  `minutes`, rejects a bad enum value, and — the two referential-integrity checks that
  Zod alone can't express — rejects a question or schedule entry pointing at an id
  that doesn't exist.
- `assertUrlIsSafe`: unparsable URL, non-http(s) protocol, localhost blocked by
  default, localhost allowed under `ALLOW_LOCAL_URLS=true`, private IP literal
  blocked.

## Trade-offs
- **Tested in isolation with plain object literals, no fixtures/factories library:**
  a test-data-builder library (e.g. `fishery`) would reduce repetition across test
  files, but for ~4 files and a handful of fields each, a small local `req()`/`q()`
  helper function per file is simpler and avoids adding a dependency for a problem
  that isn't big enough yet (YAGNI/KISS, Rules/03).
- **No test yet for the retrieval/crawler/LLM layers** — deliberate sequencing, not an
  oversight: those need mocking (HTTP, LLM responses) and are built in Phase 2/3; this
  entry only covers what exists so far. Tracked in `docs/EXECUTION_PLAN.md`.
