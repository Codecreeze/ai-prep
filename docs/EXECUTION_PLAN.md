# Execution Plan (supersedes the day-by-day framing in ROADMAP.md)

**Deadline:** Sep 24, 2026, 12:43 PM (hard — link expires, cannot reopen). Today:
Sep 22, 2026. Target: finished with margin, ideally by end of Sep 23, so Sep 24
morning is free for the walkthrough video + final deploy check, not scrambling.

**Working mode (per Rules/00):** Claude implements; Pradeep commits/pushes manually.
Claude will explicitly flag each checkpoint below with "good point to commit" and
pause. Every feature gets a `devlog/` entry (Rules/04) before it's considered done —
not just written, but explained.

## Build Order (grading-weight-first)

Automated grading (55 pts) depends entirely on the pipeline + batch command + schema
correctness — none of it depends on the UI. So that's built and validated first,
UI-less, using unit tests and the batch command itself as the proof it works. Human
review (45 pts) — the Builder, practice mode, UX polish — comes after.

### Phase 1 — Deterministic core (DONE)
- [x] Kit schema + validation (`src/server/validation/kitSchema.ts`)
- [x] Coverage check (`src/server/coverage/checkCoverage.ts`)
- [x] Schedule allocation (`src/server/scheduler/buildSchedule.ts`)
- [x] SSRF guard (`src/server/retrieval/urlValidator.ts`)
- [ ] Unit tests for all four (vitest)
→ **checkpoint: commit "deterministic core: schema, coverage, scheduler, SSRF guard + tests"**

### Phase 2 — Retrieval & crawling (DONE)
- [x] `fetchPage` (timeout, size/content-type cap, retry+backoff)
- [x] `robotsCheck`
- [x] `crawlCompanySite` + `rankLinks` (heuristic, no hardcoded path list)
- [x] `searchPublicDiscussion` (provider-abstracted, graceful "nothing found")
- [x] Unit + integration tests against a local fixture site (31 tests total, all passing)
→ **checkpoint: commit "retrieval + crawler + search, SSRF-guarded, tested against local fixture"**

### Phase 3 — LLM layer & generation (DONE)
- [x] LLM client wrapper (provider call + rate-limit/backoff + JSON-repair retry)
- [x] `extractRequirements(jd)`
- [x] `generateBrief`, `generateQuestions(requirement, category)`, `generateFlashcards`
- [x] Prompt templates with explicit untrusted-content boundary (prompt-injection defense)
- [x] Live-tested against real Gemini API; caught and fixed a model-selection issue
      (gemini-3.6-flash's free tier is 20 req/DAY, switched to gemini-3.5-flash-lite)
→ **checkpoint: commit "LLM client + generation functions, rate-limit safe"**

### Phase 4 — Orchestrator + second pass + batch CLI (DONE)
- [x] `pipeline/orchestrator.ts` — full sequence, calls Phase 1-3 pieces in order
- [x] Second-pass coverage loop (MAX_PASSES=2)
- [x] `scripts/evaluate.ts` — batch entry point, exact Appendix B I/O shape
- [x] Ran against a 3-case sample against a local fixture company site: 3/3 ok,
      all validated, ~4.5 min (well within the 15 min/5-case budget)
- [x] Confirmed failure-continues-run behavior (unreachable-company case still
      produced an honest `ok` kit rather than a hard failure, per the brief)
→ **checkpoint: commit "pipeline orchestrator + batch evaluate command working end-to-end"**
This was the single most important checkpoint — automated grading runs almost
entirely against what Phase 1-4 produce. Done.

### Phase 5 — Auth + persistence + API
- [ ] Mongoose models (`User`, `Kit`)
- [ ] Session auth (register/login/logout, HTTP-only cookie, protected-route middleware)
- [ ] Kit API routes (create, list, detail, status, delete) wired to the orchestrator
      running async with progress tracking
→ **checkpoint: commit "auth + persistence + kit API routes"**

### Phase 6 — Builder UI
- [ ] Kit read view (brief, role, questions, flashcards, schedule)
- [ ] Edit/reorder/move-category/add/delete + generated/edited/pinned state model
- [ ] Regenerate-section endpoints + UI, verified edits survive
- [ ] Loading/empty/error states throughout
→ **checkpoint: commit "Builder UI with edit-preserving regeneration"**

### Phase 7 — Practice mode + edge cases + creative feature
- [ ] Flashcard stepper, confidence capture, coverage view, weak-spot ordering
- [ ] Edge-case verification pass (thin JD, no hiring page, dead URL, duplicate
      submission, 1-day/60-day schedule)
- [ ] Optional creative feature if time remains
→ **checkpoint: commit "practice mode + edge-case handling"**

### Phase 8 — Deploy + submission package
- [ ] Deploy to Vercel + MongoDB Atlas, verify prod env vars, `ALLOW_LOCAL_URLS=false`
- [ ] Final README pass (architecture, decisions, trade-offs, setup, batch command)
- [ ] `.env.example` finalized
- [ ] Walkthrough video (3-4 min)
→ **final checkpoint: commit "deployment config + final README" then submit**

## How progress will be communicated
After each checkbox item, a short status line — not a wall of text — then at each
phase boundary, the explicit commit-point flag per Rules/00. Devlog entries are
written alongside the code, not batched at the end, so nothing gets forgotten under
time pressure.
