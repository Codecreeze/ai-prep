# 14 — Builder Edit-State Model (Phase 6, part 2 — core logic)

**Files:** `src/server/builder/editState.ts`, `nextItemId.ts`,
`questionMutations.ts`, `flashcardMutations.ts`, `briefMutations.ts`,
`regenerateQuestionsCategory.ts`, `regenerateBrief.ts`, `regenerateSchedule.ts`

## What
The core logic for the brief's own words: "the hardest state problem in the
assessment" — how a question/flashcard/brief is represented as `generated`,
`edited`, or `pinned`, and how regenerating a section respects that classification
instead of blindly overwriting everything.

## Why
The brief's Section 6 (The Builder) requires: "Regenerating one section must not
discard edits the user has made elsewhere, and a question the user wrote or edited
by hand must survive a regeneration of its category." This needed a real answer, not
a workaround — so it got built as pure, testable functions before any API route or
UI touched it, so the algorithm itself could be verified in isolation with mocked
LLM output (deterministic, no live-API flakiness in the test).

## How

**The three states (`editState.ts`):**
- `generated` — LLM output, safe to replace on regeneration.
- `edited` — user changed it (via inline edit) or added it by hand. Survives
  regeneration of its category/section.
- `pinned` — user explicitly locked it. Survives everything, including being
  considered "already covering this requirement" during regeneration (so
  regeneration won't even attempt a redundant second question for a requirement a
  pinned question already answers).

Per-item state is a separate map (`Record<itemId, EditState>`) alongside the kit
content, not embedded in the Appendix A objects themselves — keeps the kit's own
shape exactly matching the brief's required structure with zero extra fields, while
still tracking everything needed for the Builder.

**Question/flashcard CRUD (`questionMutations.ts`, `flashcardMutations.ts`)** — pure
functions taking `(kit, editState, ...)` and returning `{kit, editState}`. Editing
marks `generated → edited` (but leaves `pinned` alone — pin outranks edit); adding
marks the new item `edited` directly (a hand-written item has no "generated" origin
to protect it from); deleting a question recomputes `coverage.uncovered_requirement_ids`
immediately, since removing a question can uncover a requirement.

**The actual hard part (`regenerateQuestionsCategory.ts`):** given a category to
regenerate —
1. Split that category's current questions into `protected` (edited/pinned — kept
   verbatim) and `generated` (safe to replace).
2. Work out which requirements still need a fresh question in this category: every
   requirement the category router says applies here, **minus** any requirement a
   protected question already covers — so an edited/pinned question doesn't get a
   redundant duplicate generated alongside it.
3. Generate fresh questions only for that remaining set.
4. Rebuild `kit.questions` as `[everything not in this category] + [protected] +
   [freshly generated]` — every other category's questions and positions are
   completely untouched.
5. Recompute coverage.

**Brief and schedule regeneration** are simpler: brief re-runs the crawl+generate
pipeline wholesale (it's one blob of text, not addressable sub-items, so there's
nothing to selectively merge — protection is all-or-nothing via the pinned/edited
check, handled at the route layer with a `force` confirmation step for "edited").
Schedule regeneration has no LLM call at all — it's a pure recompute, so
"regenerate" there just means "reallocate", always safe unless pinned.

## Verified
15 new unit tests (`questionMutations.test.ts`, `flashcardMutations.test.ts`,
`regenerateQuestionsCategory.test.ts` — the last one with `generateQuestionsFor`
mocked so the algorithm is tested deterministically, without a live LLM call)
covering: edit marks generated→edited but preserves pinned; add marks hand-written;
delete recomputes coverage; reorder only touches its own category; pin/unpin
round-trip; and — the critical case — regenerating a category keeps an `edited`
question's exact original content untouched, skips generating a redundant question
for a requirement a `pinned` question already covers, and never touches another
category's questions at all. 61 tests total, all passing.

## Trade-offs
- **Regeneration rebuilds category array order (protected items first, then fresh)
  rather than preserving each surviving item's original position:** simpler and
  correct per the brief's actual requirement (survive with content intact — position
  stability within a fresh mix of old+new items isn't asked for). If exact-position
  stability mattered later, it would be a `orderedIds`-aware merge instead of a
  clean append — deferred as unnecessary complexity for now (YAGNI).
- **Unpin drops to `generated`, not back to whatever it was before pinning:** this
  is a deliberate 3-state model (not a full edit-history stack) — simplest model
  that satisfies the brief's actual requirement, chosen over tracking a
  "last-non-pinned-state" which would be over-engineering for a case the brief
  doesn't ask for.
