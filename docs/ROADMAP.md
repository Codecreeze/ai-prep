# Build Roadmap (2-3 focused days)

Sequenced so the automated-grading-heavy parts (pipeline, batch command, schema
validation — 55 pts) land before UI polish, and so something runnable exists early.

## Day 1 — Core pipeline + data layer (no UI yet)
1. Project setup: MongoDB connection, env config, Zod kit schema (Appendix A exact).
2. `retrieval` (fetch + SSRF guard + robots.txt) and `crawler` (link ranking, no
   hardcoded paths) — test against 2-3 real company sites.
3. `llm` client wrapper with retry/backoff + rate limiting; pick provider, confirm free
   tier works end-to-end with a trivial call.
4. `extraction.extractRequirements` + `generation.generateBrief/generateQuestions/
   generateFlashcards` — wire prompts, verify structured JSON output.
5. `coverage.checkCoverage` + `scheduler.buildSchedule` (deterministic) + unit tests
   for both.
6. `pipeline/orchestrator` wiring all of the above end-to-end, including the second
   coverage pass.
7. `scripts/evaluate.ts` batch command working against a small local fixture site +
   sample `cases.json` — confirm Appendix B output shape and the 15-minute budget.

## Day 2 — Auth + API + Builder UI
1. Auth: register/login/logout, session cookie, protected routes/middleware.
2. Kit CRUD API routes wired to the pipeline (async generation + status polling).
3. Kit view UI: company brief, role breakdown, question bank, flashcards, schedule —
   read-only first.
4. Builder interactions: inline edit, reorder (drag or up/down controls), move
   category, add/delete, pin — with the generated/edited/pinned state model.
5. Regenerate-section endpoints + UI, verified against the edit-preservation
   requirement (this is the highest-weighted human-review item — validate carefully).

## Day 3 — Practice mode, edge cases, polish, deploy
1. Practice mode: flashcard stepper, confidence capture, coverage view, weak-spot
   ordering.
2. Edge-case pass: thin JD, no hiring page, unreachable URL, invalid LLM JSON,
   duplicate submission, 1-day/60-day schedule — verify each behaves per brief.
3. Loading/empty/error states across the UI; responsive + keyboard pass.
4. Optional creative feature, if time allows.
5. Deploy (Vercel + MongoDB Atlas), verify both frontend and API publicly reachable
   with production env vars (SSRF guard active, `ALLOW_LOCAL_URLS=false`).
6. README (architecture, decisions, trade-offs, setup, batch command instructions),
   `.env.example`, walkthrough video.

## Day 4 (slack)
Buffer for whatever slipped — prioritize automated-grading correctness (pipeline
sequencing, coverage, schedule, structure validation, robustness) over additional UI
polish, since it's weighted higher (55 vs 45) and is what the unseen-JD test pass
actually exercises.
