# 02 — Coverage Check & Schedule Allocation

**Files:** `src/server/coverage/checkCoverage.ts`, `src/server/scheduler/buildSchedule.ts`

## What
Two pure, deterministic functions with zero LLM involvement:
- `checkCoverage(requirements, questions)` → returns the list of `must`-priority
  requirement ids that have no question referencing them.
- `buildSchedule(requirements, questions, days)` → returns a day-by-day schedule
  (`{day, focus, question_ids, minutes}[]`) with exactly `days` entries.

## Why
The brief is unusually explicit about this: "Two of these steps are deterministic and
must not be handed to the model. Allocating topics across the days available is
arithmetic... Comparing the extracted requirements against the generated questions to
find the gaps is likewise your code's decision to make, not the model's." Handing
either of these to an LLM would be both wrong per the spec and worse in practice — an
LLM asked "which requirements are uncovered" can hallucinate or miscount, where a
`Set` lookup can't.

## How

**Coverage:** build a `Set` of every requirement id referenced by any question's
`requirement_ids`, then filter the requirement list down to `priority === "must"` and
not in that set. `nice` requirements are excluded on purpose — the brief's own
language ("a kit that ships with uncovered must-have requirements has failed") only
makes coverage a hard requirement for `must` items.

**Schedule:** questions are ranked by a weight score — 1000 points if they cover any
`must` requirement, plus `difficulty * 10` — then sorted descending and sliced into
`days` roughly-equal buckets in that sorted order. Because the sort is
hardest/highest-priority-first, bucket 1 (day 1) ends up loaded with the hardest and
most important material, which directly satisfies "harder and higher-priority
material lands earlier, not the night before." Each day's `minutes` is
`question_count * 15` (a fixed per-question estimate) — always an integer, per the
brief's "no floats, no 'about an hour'" rule. `days` is clamped to `[1, 60]` so the
1-day and 60-day edge cases in the brief can't produce a crash or a zero-day schedule.

## Trade-offs
- **Fixed 15-minutes-per-question vs a per-question effort estimate:** a more
  "realistic" version would ask the LLM to estimate minutes per question. Rejected —
  that would make `minutes` non-deterministic and re-introduce exactly the kind of
  LLM-owned arithmetic the brief says not to do. A fixed constant is simple, defensible
  in an interview ("every question gets a flat 15-minute prep/review budget"), and
  keeps the whole function pure and unit-testable without mocking an LLM call.
- **Round-robin-over-sorted-list vs a true bin-packing/knapsack allocation:** a
  bin-packing approach could balance `minutes` per day more evenly. Rejected as
  over-engineering for this scope (Rules/03) — the simple slice-of-a-sorted-list
  approach already satisfies every stated requirement (every day has content, harder
  material is earlier, must-haves are covered) without the added complexity of a
  packing algorithm that isn't asked for.
- **60-day case:** with few generated questions spread across 60 days, later days can
  end up with `question_ids: []` and `minutes: 0`. This is an honest reflection of
  "there isn't 60 days of material," which matches the brief's broader theme
  (thin input → thin, honest output, not padded/fabricated content) — but it's a
  known limitation worth calling out if asked, rather than something silently "fixed"
  by inventing review sessions.
