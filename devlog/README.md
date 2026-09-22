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
| 09 | [09-auth-persistence-and-kit-api.md](./09-auth-persistence-and-kit-api.md) | Mongoose models, JWT-cookie session auth, kit CRUD API routes wired to async pipeline generation — type-checks clean, 46 tests passing (live DB test NOT VERIFIED yet — pending MongoDB URI) |
