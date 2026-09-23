# 25 — Stay-on-Page Kit Creation, Confirm Dialogs, Wider Layout

**Files:** `src/lib/uiSlice.ts` (extended), `src/components/kits/
KitCompletionWatcher.tsx` (new), `KitCompletionModal.tsx` (new), `CreateKitForm.tsx`,
`src/components/ui/Modal.tsx` (new), `ConfirmDialog.tsx` (new),
`src/components/kits/KitsTable.tsx`, `src/components/nav/UserMenu.tsx`,
`src/app/dashboard/layout.tsx`, `src/components/kits/KitDetail.tsx`,
`src/components/practice/PracticePage.tsx`

## What
Three direct feature requests, plus a real bug found and fixed while verifying the
first one live:
1. Submitting the create-kit form no longer navigates away — the user stays on
   Analyze, the form clears, and the new kit shows up "Generating..." in the recent
   list while they can immediately start another one. A background watcher pops a
   modal ("Open" / "Later") once that kit finishes.
2. Every destructive action (delete a kit, sign out) now requires confirming in a
   dialog first — nothing fires on a single accidental click.
3. Dashboard content is noticeably wider — flat 20px page padding, and the
   kit-detail page's inner `max-w-2xl` constraint was removed entirely (practice
   mode widened from `max-w-lg` to `max-w-3xl`, kept moderate since a single
   flashcard stretched edge-to-edge on an ultrawide screen reads worse, not better).

## Why
Direct feedback: navigating away mid-generation interrupts a workflow where the
user might reasonably want to queue up several kits back-to-back; a stray click on
Delete or Sign out having zero confirmation is a real risk for an irreversible
action; and the content area was visibly under-using the available width next to
the sidebar.

## How

**Stay-on-page + completion modal** — a new slice of `uiSlice` state,
`watchingKitIds: string[]` and `completedKitNotice: {...} | null`.
`CreateKitForm` dispatches `watchKit(id)` on success instead of navigating.
`KitCompletionWatcher` (mounted once, in the dashboard layout, so it's active
across every dashboard page) polls the same `useListKitsQuery` cache every 4s,
diffing each watched kit's status against a `useRef`-held previous value to detect
a `pending → ready/failed` transition, and dispatches `completedKitNotice` +
`unwatchKit` when it sees one. `KitCompletionModal` reads that notice and renders
the Open/Later modal. This is one of the few places in the codebase where
`useEffect`/`useRef` are the right tool per Rules/01 — the effect reacts to a
genuinely external, asynchronous system (a background LLM pipeline job finishing on
its own schedule), and the ref exists specifically to remember each kit's *previous*
status across polls so a *transition* can be detected, not as a substitute for
ordinary render-time state.

**The bug this surfaced:** live-testing the very first version of this feature, the
modal never appeared. Added temporary `console.error` instrumentation (removed
once diagnosed) rather than guessing, and traced it precisely: right after
`createKit` resolves, `dispatch(watchKit(id))` fires and `KitCompletionWatcher`'s
effect runs *immediately*, against whatever `data` the shared RTK Query cache
currently holds — which can still be the pre-creation snapshot, since the
mutation's `invalidatesTags`-triggered refetch is itself asynchronous and hasn't
landed yet. The brand-new kit is therefore briefly absent from `data.kits`, and the
original code treated "not found in the list" as "must have been deleted while we
were watching it," immediately unwatching a kit that had, in reality, just been
created. **Fix:** only conclude "deleted" if the kit had been *previously observed*
at least once (tracked via the same `lastKnownStatus` ref); a kit that's simply not
in the list *yet* is left alone to be picked up on the next poll. Verified fixed
with a full clean-session retest: modal appeared correctly, showing the right role/
company, and "Open" navigated to the correct kit.

**Confirm dialogs** — a generic `Modal` primitive (backdrop + centered card) and a
`ConfirmDialog` built on it (title/message/Confirm/Cancel, `danger` variant for
red-styled destructive actions). `KitsTable`'s delete button now opens a dialog
naming the specific kit before calling the delete mutation; `UserMenu`'s "Sign out"
does the same. Reused the same two primitives for the completion modal (`Modal` +
its own button layout) rather than building three separate one-off overlay
implementations — one modal shell, three uses.

**Wider layout** — `dashboard/layout.tsx`'s `<main>` padding simplified to a flat
`px-5` (20px) instead of responsive `px-4 sm:px-6`; `KitDetail`'s outer
`max-w-2xl mx-auto` wrapper removed so kit-section cards use the full available
width next to the sidebar; practice mode widened from `max-w-lg` to `max-w-3xl` (a
judgment call, not literal edge-to-edge, since a single flashcard filling an
ultrawide viewport is harder to read, not easier).

## Verified
Live end to end, in a fully clean dev-server session (no HMR artifacts, learned
from an earlier false trail where my own debug instrumentation caused a transient
dual-store desync that looked like a bug but wasn't): submitted a kit, form cleared
immediately with an inline "Added to your kits — generating now" confirmation,
recent list showed it as `pending`, generation completed server-side, and the
completion modal appeared unprompted with the correct role/company and an "Open"
button that navigated to the finished kit. `tsc`/`lint` clean, 76 tests still
passing (this phase's logic changes — the watcher's stale-cache handling — aren't
covered by a dedicated unit test yet, since they depend on real RTK Query cache
timing that's awkward to simulate deterministically; flagged as a coverage gap
rather than silently left untested).

## Trade-offs
- **Watching state lives only in Redux (memory), not persisted to localStorage:**
  a hard page reload loses the watch list, so a kit that finishes generation while
  the user has refreshed or closed the tab won't trigger a modal when they come
  back (though it's still sitting there, visibly `ready`, in the recent list and
  the Kits table — nothing is lost, just the popup notification). Persisting watch
  state across reloads was judged unnecessary complexity for what the request
  actually asked for (stay on the page and get notified while you keep using the
  app), not a gap worth closing under the current deadline.
- **No dedicated unit test for the watcher's transition-detection logic:** the bug
  fixed here was specifically about *cache timing*, which is exactly the kind of
  thing that's hard to unit-test meaningfully without a real (or heavily mocked)
  RTK Query store — live browser verification was the practical choice here, with
  the trade-off noted honestly rather than claiming coverage that doesn't exist.
