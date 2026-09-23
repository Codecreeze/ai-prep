# 16 — Mongoose Mixed-Field Default Bug (caught by live testing)

**Files:** `src/server/persistence/models/Kit.ts`, `src/server/persistence/kitRepo.ts`,
`src/components/kits/KitDetail.tsx`

## What happened
The very first live browser test of the newly-built Builder UI crashed immediately
on page load: `TypeError: Cannot read properties of undefined (reading 'q1')`. Ruled
out several red herrings before finding the real cause — worth recording the process,
not just the fix, since the debugging path is as instructive as the bug:

1. First suspected stale Turbopack HMR state (this dev environment had shown
   Turbopack worker crashes before) — did a full clean restart (`rm -rf .next`,
   kill and restart the dev server). Same crash, reproducibly.
2. Suspected browser-tab state — closed the tab entirely, opened a fresh one,
   logged in again from scratch. Same crash.
3. Fetched the API response directly via the browser's own `fetch()` (not curl, to
   rule out any client/server discrepancy) and confirmed `kit.questions` itself was
   a perfectly clean 4-item array — so the crash wasn't in the data the component
   was mapping over.
4. Read the exact console error text precisely (`read_console_messages`, not just
   the visual overlay): `Cannot read properties of undefined (reading 'q1')`. That
   phrasing — reading a *property named 'q1'* — meant something was doing
   `X['q1']` where `X` was undefined, i.e. `editState.questions['q1']` with
   `editState.questions` itself undefined, not `kit.questions` containing a bad
   entry as first assumed.
5. Fetched the raw `editState` field directly: `{"brief": "generated", "schedule":
   "generated"}` — **`questions` and `flashcards` were missing entirely**, even
   though the Mongoose schema declares `default: {}` for both.

## Root cause
A known Mongoose gotcha: a plain object-literal `default: {}` on a
`Schema.Types.Mixed` field is not reliably applied when a document is created —
confirmed empirically here (the sibling `String`-typed fields in the same nested
`editState` object, `brief`/`schedule`, got their string defaults applied correctly;
only the two `Mixed`-typed ones silently didn't). The kit was created via
`Kit.create({...})` without an explicit `editState`, expecting the schema defaults
to fill it in — they partially didn't.

## Fix
Two layers, both real fixes, not just patches over the symptom:

1. **Root cause, going forward:** changed `default: {}` to `default: () => ({})` on
   both Mixed fields (and the similarly-typed `practice.confidence` field, same
   pattern) in `models/Kit.ts`. A function default is always invoked per-document by
   Mongoose, which sidesteps whatever internal special-casing skips a bare object
   literal for Mixed types. New kits created from now on get a fully-populated
   `editState` from the start.
2. **Defensive, for already-affected data:** `loadReadyKitForEdit` (server) and
   `KitDetail` (client) both now deep-merge the loaded `editState` against
   `emptyEditState()` (`{...emptyEditState(), ...editState}`) instead of only
   falling back when the whole object is nullish. This means even a kit created
   before the schema fix — with a partial `editState` missing `questions`/
   `flashcards` — renders and edits correctly with no migration script needed.

## Verified
After the fix: same kit (no data migration, same document), reloaded — renders
cleanly, no crash. Then ran the actual scenario this was blocking: inline-edited a
question, saved, clicked "Regenerate" on its category, and confirmed via both the UI
and a direct API check that the edited question survived untouched while the
category's other question was eligible for replacement (see `devlog/15`).

## Why this belongs in the devlog
This is the clearest example in the whole build of live testing catching something
neither `tsc` nor unit tests could have: the TypeScript types were correct
(`KitEditState` says `questions: Record<string, EditState>`, never `undefined`), and
no unit test exercised the real Mongoose document-creation path (mutation unit tests
in `devlog/14` construct plain `Kit`/`KitEditState` objects directly, bypassing
Mongoose entirely — correctly, since that's what makes them fast and
deterministic). Only an actual browser hitting an actual persisted document surfaced
this. It's also a concrete demonstration of not settling for the first plausible
explanation (HMR flakiness) when the evidence didn't fully support it — the
"clean restart still fails" result is what forced the investigation to go deeper
instead of stopping at a comfortable but wrong answer.
