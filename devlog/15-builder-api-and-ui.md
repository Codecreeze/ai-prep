# 15 — Builder API & UI (Phase 6, part 2 — wiring)

**Files:** `src/server/http/withKitEdit.ts`, `src/server/persistence/kitRepo.ts`,
~15 new route files under `src/app/api/kits/[id]/**`, `src/lib/api/kitsApi.ts`
(extended), and the interactive components: `QuestionItem.tsx`,
`AddQuestionForm.tsx`, `RegenerateButton.tsx`, `EditStateBadge.tsx`,
`FlashcardItem.tsx`, `AddFlashcardForm.tsx`, restyled `CompanyBriefSection.tsx`,
`QuestionBankSection.tsx`, `FlashcardsSection.tsx`, `ScheduleSection.tsx`

## What
Every route and UI control needed to actually use the mutation logic from
`devlog/14`: edit/delete/add/move/pin for questions, edit/delete/add/pin for
flashcards, edit/pin for the brief, and regenerate for brief/each question
category/schedule.

## Why
The logic from `devlog/14` is only useful if a real user (or Pradeep, defending this
in an interview) can actually click something and see it happen. This wires it end
to end, following the same layering the rest of the app uses (Rules/03: separation
of concerns — routes stay thin, all real logic lives in `src/server/builder/`).

## How

**`withKitEdit.ts`** — one shared helper every "plain" mutation route uses: auth
check, load the kit (404 if missing/not-owned/not-ready), run the mutation, persist,
respond. Cuts ~10 lines of repeated boilerplate out of every route file, so each one
reads as "what mutation applies here," not a copy of the same auth/load/save
dance. Two routes (`regenerate/company-brief`, `regenerate/schedule`) don't use it —
they need a pre-check (pinned/force-confirmation logic) before deciding whether to
mutate at all, which doesn't fit the generic wrapper's contract, so they're written
out directly rather than bending the shared helper to fit an edge case.

**Frontend pattern, repeated across every editable item** (`QuestionItem.tsx`,
`FlashcardItem.tsx`, the brief section): local `useState` holds a draft while
editing; a Save button fires the RTK Query mutation; the mutation's
`invalidatesTags: [{type: "Kit", id}]` causes `useGetKitQuery` to refetch and the UI
reflects the server's real state. This is what the brief means by "feel immediate
rather than round-tripping for every keystroke" — edits are local until explicitly
saved (no PATCH per keystroke), and the round-trip only happens once, on Save.

**Move-category** is a plain `<select>`, not drag-and-drop — deliberately: it
satisfies "move a question from one category to another" with zero extra
dependency, and is naturally keyboard-and-screen-reader operable without any special
handling, which a custom drag interaction would need to be built for separately.
Reordering within a category was implemented on the backend
(`reorderQuestionsInCategory`, tested) but the corresponding drag-to-reorder UI
control wasn't wired in this pass — a known gap, tracked for the edge-case/polish
pass in Phase 7 rather than adding a drag library under time pressure right now.

**Regenerate-brief confirmation flow**: `CompanyBriefSection` calls the mutation; if
the server responds `409 CONFIRMATION_REQUIRED` (brief has manual edits), the UI
shows a plain `window.confirm()` and retries with `force: true` on confirmation —
simplest possible implementation of "ask before overwriting edits," matching
Rules/03's KISS preference over building a custom modal for a single, rare
confirmation.

## Verified
Live-tested in browser end to end after fixing the bug in `devlog/16`: inline-edited
a real technical question's prompt to a distinctive marker string, saved it,
clicked "Regenerate" on that same category, and confirmed via both the UI and a
direct API check that the edited question survived with its exact edited content and
an `edited` badge, while the category's other (unedited) question was eligible for
replacement — matching exactly what `devlog/14`'s unit tests already proved
deterministically. `npx tsc --noEmit` and `npm run lint` both clean; 61 tests
passing (15 new from this phase, covering the mutation logic these routes call).

## Trade-offs
- **Reorder UI deferred:** the backend function and its tests exist; the drag
  interaction doesn't yet. Flagged explicitly rather than silently left out — will
  be picked up in the Phase 7 pass alongside the rest of the edge-case/polish work,
  or noted as a known limitation in the README if time runs out first.
- **No optimistic UI updates:** every mutation waits for the server response before
  the UI updates (via cache invalidation + refetch), rather than updating local
  state immediately and rolling back on failure. Simpler and more obviously correct
  under time pressure; the trade-off is a brief (sub-second, same-region API call)
  delay before an edit visibly "sticks" — acceptable given RTK Query's refetch is
  fast and every mutation already shows its own loading state.
