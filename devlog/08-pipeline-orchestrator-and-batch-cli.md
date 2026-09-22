# 08 — Pipeline Orchestrator & Batch CLI (Phase 4)

**Files:** `src/server/pipeline/orchestrator.ts`, `scripts/evaluate.ts`,
`fixtures/serve-fixture.ts`, `fixtures/cases.sample.json`

## What
`runPipeline()` — the single function that runs the entire research+generation
sequence end to end and returns a validated kit — plus `npm run evaluate`, the
mandatory batch CLI from Section 9 of the brief, which calls `runPipeline()` per case
and writes the exact Appendix B JSON shape.

## Why
This is the highest-weighted checkpoint in the whole project: automated grading (55
of 100 points) runs almost entirely by feeding this exact code unseen job
descriptions. It also has to be the SAME code path the web app will use later — the
brief is explicit that the batch command must run "the same code your application
uses, not a parallel implementation."

## How

**Sequencing in `orchestrator.ts`** (matches `docs/PIPELINE_DESIGN.md`):
extract requirements + crawl company site run in parallel (independent of each
other) → search public discussion → generate brief from crawl+discussion → generate
questions per (requirement × relevant category) in parallel → deterministic coverage
check → up to one additional targeted pass on any gap requirements → generate
flashcards from the final question bank → deterministic schedule → Zod-validate the
assembled kit before returning it. If validation fails, the function throws rather
than silently returning a malformed kit — the batch script catches that and records
it as a `failed` case with a structured error, rather than writing bad data.

**`scripts/evaluate.ts`** — reads `--input`/`--output` args, loads the cases file,
runs all cases through `runPipeline()` with `p-limit(2)` bounded concurrency (keeps
LLM request volume manageable while still finishing well inside the 15-minute/5-case
budget), wraps each case in try/catch so one failure never aborts the run, classifies
errors into codes (`COMPANY_UNREACHABLE`, `LLM_RATE_LIMITED`, `INVALID_KIT_GENERATED`,
etc.), and writes the single `kits.json` file in the exact Appendix B shape.

**Proof it actually works** — built a local fixture "company site"
(`fixtures/serve-fixture.ts`, served at `localhost:8099/acme/`, mirroring Appendix
B's own example) with hiring info at a deliberately unconventional path
(`/handbook/how-we-hire`), and three test cases: a normal JD, a two-line thin JD, and
a JD paired with an unreachable company URL. Ran the real `npm run evaluate` command
against them:
- **Normal case**: found the unconventional hiring page, correctly extracted the
  take-home → system-design → behavioural process into the brief, 4 requirements,
  full coverage, valid 5-day schedule.
- **Thin JD case**: produced exactly 1 requirement — no padding/invention.
- **Unreachable-company case**: `status: "ok"` (not "failed" — per the brief, partial
  research isn't a failure), `pages_used: []`, and an honest brief stating plainly
  that no information was found, instead of fabricating one.
- All three passed `validateKit()` (structure + referential integrity) with zero
  errors. Total runtime ~4.5 minutes for 3 cases at concurrency 2 — extrapolates to
  well inside the 15-minute budget for 5.

## Trade-offs
- **`p-limit(2)` vs higher concurrency:** running more cases fully in parallel would
  finish faster, but multiplies simultaneous LLM request bursts against a free-tier
  quota that's already tight (see entry 07) — 2 was chosen as the balance that still
  clears the 15-minute budget with margin without provoking more rate-limiting than
  the retry logic can smoothly absorb.
- **One additional coverage pass (`MAX_COVERAGE_PASSES = 2` total) rather than
  looping until fully covered:** matches the reasoning in
  `docs/PIPELINE_DESIGN.md` §4 — a requirement still uncovered after one targeted
  retry is more likely a genuinely awkward/vague requirement than a fixable prompt
  issue, and unbounded retries would risk both the time budget and the daily quota.
  Any requirement still uncovered after both passes is reported honestly in
  `coverage.uncovered_requirement_ids`, not hidden.
- **Orchestrator throws on invalid output rather than returning a partial/best-effort
  kit:** a stricter stance than strictly necessary, but matches the brief's framing
  that a kit failing structural validation is worse than an honest `failed` batch
  entry — better for the batch script to record a clear, typed error than to persist
  or ship a kit that silently violates the required shape.
