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
