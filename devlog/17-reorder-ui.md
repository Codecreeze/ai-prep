# 17 — Reorder UI (closing the Phase 6 gap)

**Files:** `src/components/kits/sections/QuestionItem.tsx`,
`QuestionBankSection.tsx`, `src/components/ui/IconButton.tsx`

## What
Up/down move buttons on each question, letting the user reorder questions within
their category. Wires the already-tested `reorderQuestionsInCategory` backend
function (built and unit-tested in Phase 6, but left without a UI control at the
time — flagged explicitly in `devlog/15` as a known gap).

## Why
The brief requires "Reorder questions, and move a question from one category to
another" as part of the Builder. Move-category already existed (a `<select>`);
within-category reordering needed its own control.

## How
`QuestionItem` takes `canMoveUp`/`canMoveDown`/`onMoveUp`/`onMoveDown` props;
`CategoryGroup` (in `QuestionBankSection`) computes them from the question's index
within its own category array and constructs the new `orderedIds` array by swapping
two adjacent ids before calling the existing `reorderQuestions` mutation.

## Trade-offs
- **Up/down buttons vs. drag-and-drop:** chosen over adding a DnD library
  (`@dnd-kit` was originally in the planned library list — see the very first
  `docs/TRD.md`). Buttons are simpler to implement correctly, need zero extra
  dependency, and are natively keyboard-operable (Tab + Enter) and touch-friendly
  without any special handling — drag interactions typically need separate,
  non-trivial work to be accessible by keyboard at all. Since the brief explicitly
  scores keyboard access, this is a case where the "less impressive-looking" option
  is actually the better engineering choice for this project's grading criteria, not
  just a shortcut under time pressure.

## Verified
Live-tested: fetched a kit's technical-category question order via the API
(`q3, q2`), clicked "Move down" on the first question in the browser, re-fetched, and
confirmed the order flipped to `q2, q3` exactly as expected.
