# Devlog Index

Running build log for the AI Interview Prep Kit project. One entry per logical unit
of work, in build order. See `Rules/04-explainability-and-devlog.md` for what each
entry must contain.

| # | Entry | Summary |
|---|-------|---------|
| 01 | [01-kit-schema-and-validation.md](./01-kit-schema-and-validation.md) | Zod schema mirroring Appendix A exactly + referential-integrity checks |
| 02 | [02-coverage-and-scheduler.md](./02-coverage-and-scheduler.md) | Deterministic coverage-gap check and day-by-day schedule allocation |
| 03 | [03-ssrf-guard.md](./03-ssrf-guard.md) | URL validator blocking private/loopback addresses, with a documented local-dev/batch opt-out |
| 04 | [04-phase1-tests.md](./04-phase1-tests.md) | Vitest suite for schema validation, coverage check, scheduler, SSRF guard — 24 tests, all passing |
| 05 | [05-retrieval-and-crawler.md](./05-retrieval-and-crawler.md) | fetchPage, robots.txt check, heuristic hiring-page discovery, public-discussion search — with tests (31 total, all passing) |
| 06 | [06-llm-layer-and-generation.md](./06-llm-layer-and-generation.md) | Gemini client with rate-limit/backoff, requirement extraction, question/brief/flashcard generation — with tests (43 total, all passing) |
| 07 | [07-model-selection-incident.md](./07-model-selection-incident.md) | Live sanity check caught a bad model choice (20 req/day free quota) before it reached the batch run — switched to gemini-3.5-flash-lite |
| 08 | [08-pipeline-orchestrator-and-batch-cli.md](./08-pipeline-orchestrator-and-batch-cli.md) | Full pipeline orchestrator + second-pass coverage loop + `npm run evaluate` batch CLI — proven end-to-end against a local fixture company site, 3/3 kits valid |
| 09 | [09-auth-persistence-and-kit-api.md](./09-auth-persistence-and-kit-api.md) | Mongoose models, JWT-cookie session auth, kit CRUD API routes wired to async pipeline generation — type-checks clean, 46 tests passing |
| 10 | [10-live-db-verification-and-fixes.md](./10-live-db-verification-and-fixes.md) | Live end-to-end verification against real MongoDB Atlas — caught and fixed a Windows SRV-DNS connection bug and an unawaited-promise bug in async kit generation |
| 11 | [11-redux-toolkit-setup-and-auth-ui.md](./11-redux-toolkit-setup-and-auth-ui.md) | Redux store + RTK Query API slices, auth pages (login/register), dashboard layout with server-side auth gate — live-tested in browser |
| 12 | [12-kit-read-view-and-progress-polling.md](./12-kit-read-view-and-progress-polling.md) | Kit create form, kit list, and the full read-only kit view (brief/role/questions/flashcards/schedule) with self-stopping progress polling |
| 13 | [13-visual-design-pass.md](./13-visual-design-pass.md) | Real design system (color tokens, UI primitives) replacing default-Tailwind wireframe styling — verified on desktop and mobile in browser |
| 14 | [14-builder-edit-state-model.md](./14-builder-edit-state-model.md) | The generated/edited/pinned mutation logic + regenerate-without-clobbering algorithm — pure, testable functions, 15 new unit tests |
| 15 | [15-builder-api-and-ui.md](./15-builder-api-and-ui.md) | Builder API routes and interactive UI (inline edit, delete, pin, move category, add, regenerate) wired to the mutation logic |
| 16 | [16-mongoose-mixed-default-bug.md](./16-mongoose-mixed-default-bug.md) | Live browser testing caught a real Mongoose bug (Mixed-field object-literal defaults silently not applied) that broke the entire Builder — found, root-caused, and fixed with both a schema fix and defensive merging |
