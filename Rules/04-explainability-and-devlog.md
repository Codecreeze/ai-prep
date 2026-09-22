# Explainability & Devlog Rules (VERY IMPORTANT)

Pradeep needs to be able to explain every part of this project himself in an
interview. Code that isn't explained isn't done.

1. **Every time a feature, file, or non-trivial piece of code is created,** log an
   entry in `devlog/` (see structure below) covering:
   - **What** was built.
   - **Why** it was built this way — the reasoning, not just the description.
   - **How** it works, briefly.
   - **Trade-offs considered** — what the alternative approach(es) would have been,
     and why the chosen one won for this project's constraints (deadline, scope,
     free-tier limits, assessment grading weights, etc).
   - If a feature needed something extra beyond the obvious approach, say so
     explicitly: "the naive approach would be X, but that breaks under Y, so instead
     we do Z."
2. **Devlog structure:** `devlog/NN-topic.md`, numbered in build order, one file per
   logical unit of work (e.g. `01-kit-schema-and-validation.md`,
   `02-coverage-and-scheduler.md`, `03-ssrf-guard.md`). Not one giant file — keep
   each entry scoped so Pradeep can review a single topic before an interview.
3. **`devlog/README.md`** is the index, kept up to date, one line per entry.
4. Devlog entries are written in plain language first, technical detail second —
   Pradeep should be able to read the "why" paragraph and explain it in his own words
   without re-deriving it from the code.
5. This applies to Claude directly and to any subagent invoked for this project —
   subagents must also write their devlog entry for whatever they built before
   reporting done.
