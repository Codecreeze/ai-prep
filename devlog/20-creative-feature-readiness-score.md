# 20 — Creative Feature: Readiness Score

**Files:** `src/server/practice/readinessScore.ts`,
`src/app/api/kits/[id]/practice/readiness/route.ts`, `src/lib/api/practiceApi.ts`
(extended), `src/components/practice/ReadinessScoreCard.tsx`, wired into
`PracticePage.tsx`

## What it is
A single "how ready am I for this interview" percentage, shown both overall and
broken down per requirement, with the weakest requirements surfaced first as
explicit "focus areas."

## Why this instead of the brief's own suggested examples
The brief lists mock interview mode, a weak-spots report, a printable one-pager, or
comparing two postings — and explicitly says "an idea of your own is better." A
plain weak-spots report would just filter and display data the app already computes
(coverage, confidence) separately. The Readiness Score does something the brief's
suggestions don't: it **synthesizes two independently-computed signals into one
judged, weighted metric**, which is a level up from "surface existing data" to
"decide how existing data should be combined and why." That decision-making is
exactly what the brief says it's evaluating ("what you refused to let the model
decide" — here, extended to "what math decides this, and why this math").

## The actual design decision (the part worth defending)
For each requirement:
- **No flashcards exist for it at all** → score is pure coverage (0 or 100%).
  Reasoning: there's nothing to have practiced, so confidence can't fairly penalize
  it — a requirement can be "covered" (a question exists) without yet having
  practice material.
- **Flashcards exist** → score blends **40% coverage + 60% confidence**. Confidence
  weighted higher because a requirement can have a question and still be the thing
  the user is least ready for — coverage alone (which the existing `kit.coverage`
  field already tracks) says "a question exists," not "the candidate is ready."
  A flashcard the user has never answered counts as confidence 0, not skipped or
  averaged-away — consistent with `orderNextSession.ts`'s same treatment of unseen
  cards, so the two features agree on what "not yet practiced" means.
- **`must` requirements weight double** toward the overall score vs. `nice` — a kit
  weak on a required skill should visibly hurt the number more than being weak on a
  bonus one.

## Verified
7 new unit tests covering: zero-flashcard fallback to pure coverage; blended
scoring math; unanswered-card-counts-as-zero (not skipped); must-weighting in the
overall average; empty-requirements edge case (100%, nothing to be unready for);
multi-flashcard averaging per requirement.

**Live-verified in browser** with real generated data, and this is where the design
actually proved itself: before any practice, both must-have requirements showed
40% (100% coverage × 0.4 + 0% confidence × 0.6 — exactly the formula). After
answering one flashcard "very confident" (5/5), the score for that requirement rose
to **70%, not 100%** — because that requirement had a *second*, still-unanswered
flashcard dragging the average down. That's the blended-average design working
exactly as intended on real data, not a contrived test case: partial practice on a
requirement correctly shows as partial readiness, not full credit for one good
answer.

## Trade-offs
- **Fixed 40/60 coverage/confidence split and 2x/1x must/nice weighting, not
  configurable:** simplest defensible choice for the assessment's scope — the
  brief asks to "pick one and defend it," not to build a tunable scoring system.
  Documented and testable, which matters more here than configurability no one
  asked for (Rules/03: no over-engineering).
- **Score is recomputed on every request, not cached:** the computation is O(n)
  over requirements/questions/flashcards, trivially cheap — caching would be
  premature optimization for kit sizes this app produces (tens of items, not
  thousands).
