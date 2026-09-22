# Code Quality Rules (STRICT)

1. **No over-engineering.** Build exactly what the current requirement needs. No
   speculative abstractions, no config options for hypothetical future cases, no
   design patterns applied because they're "best practice" in the abstract rather
   than because this code needs them.
2. **DRY** — don't duplicate logic across files; extract a shared function once a
   second real usage appears (not preemptively on the first).
3. **KISS** — the simplest implementation that correctly satisfies the requirement
   wins over a cleverer one.
4. **YAGNI** — don't build it until it's needed.
5. **Single responsibility per file/function.** A function does one thing; a module
   owns one concern (see the service-layer split in `docs/ARCHITECTURE.md`).
6. **No silent failure.** Every catch block either handles the error meaningfully,
   records it (batch/pipeline error reporting), or rethrows — never swallow-and-
   ignore.
7. **No dead code.** Delete unused code rather than commenting it out.
8. **Type safety:** TypeScript strict mode stays on; no `any` unless there's a
   documented reason (e.g. a third-party type gap) with a one-line comment.
9. **Naming:** descriptive, unabbreviated names for anything non-trivial. File names
   match their default export.
10. **Determinism stays deterministic.** Per `docs/PIPELINE_DESIGN.md`: coverage
    checking and schedule allocation are pure functions, never routed through the LLM.
