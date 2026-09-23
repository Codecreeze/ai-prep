# 18 — Practice Mode

**Files:** `src/server/practice/orderNextSession.ts`, `practiceCoverage.ts`,
API routes under `src/app/api/kits/[id]/practice/**`, `src/lib/api/practiceApi.ts`,
`src/components/practice/*`

## What
The brief's Section 7: step through flashcards one at a time, reveal the answer,
record confidence per card, show overall coverage, and order the next session by
what the user was least confident about.

## Why / the ordering decision
The brief explicitly frames this as an open design choice: "A simple confidence-
weighted sort is fine; a proper spaced-repetition interval is fine. Pick one and
defend it." Chose confidence-weighted sort, not spaced repetition, because: this
app's whole framing is "days until interview," not open-ended long-term retention —
there's no session-date/interval concept anywhere else in the data model, and a real
spaced-repetition scheduler (SM-2 or similar) needs review-date tracking that would
be pure speculative complexity for a tool whose actual job is "cram the weakest
material hardest, right now." A never-answered card ranks as *less* confident than
even a card rated 1/5, so a first session naturally starts unseen-first in original
kit order, and a repeat session leads with whatever scored lowest last time.

## How
**`orderNextSession`** — pure function, `[...flashcards].sort((a,b) =>
weight(a)-weight(b))` where `weight` is the stored confidence or `0` if never
answered. Pure and stateless, no DB/LLM involvement, so it's directly unit-testable
(4 tests: unseen-first, ascending-confidence order, unseen-ranks-below-even-lowest-
rated, and no-mutation-of-input).

**`computePracticeCoverage`** — tallies covered/total overall and per-requirement
(via each flashcard's `requirement_ids`), so the coverage bar and any future
per-topic breakdown both come from one source of truth (4 tests).

**API** — `GET .../practice/next` (returns the ordered queue), `POST
.../practice/:cardId/answer` (records confidence + marks covered), `GET
.../practice/coverage`. All reuse `loadReadyKitForEdit` from the Builder work rather
than a separate loader, since the ownership/ready-check logic is identical.

**Frontend — the one place `useEffect`-free posed a real design question:**
`PracticeSessionRunner` takes the fetched flashcard order as a prop and snapshots it
into local `useState` on mount. Deliberately does NOT re-derive the queue from the
live query on every render — RTK Query's cache invalidation after each `answerCard`
call would otherwise re-sort the *remaining* cards by their just-updated confidence,
reshuffling the queue mid-session in a way that would be disorienting (you answer
"very confident" and the next card jumps around instead of just... being the next
card). Snapshotting a session's order once, at start, and locally advancing an index,
keeps the session experience stable and matches "practise against it inside the app"
as an actual session, not a live-resorting list.

## Verified
Live end to end: created a kit, opened `/kits/:id/practice`, saw "Card 1 of 4" with
"Covered 0/4", revealed the answer, rated confidence 2 ("Barely"), watched the app
advance to "Card 2 of 4" and the coverage bar update to "1/4" — then confirmed via a
direct API check that `practice.confidence` and `practice.coveredCardIds` persisted
correctly on the kit document.

## Trade-offs
- **No per-requirement weak-spots breakdown in the UI yet** (the data —
  `computePracticeCoverage`'s `byRequirement` — already supports it): scoped out of
  this pass to keep it shippable; a natural candidate for the optional creative
  feature, since it's a small UI addition on top of data that already exists.
- **"Practice again" simply resets the local index to 0, replaying the same
  snapshot order** rather than re-fetching a freshly re-sorted queue: intentional —
  once a session starts, its order is fixed for the whole session (see above); a
  genuinely fresh re-sorted session starts by navigating back to `/practice`, which
  re-mounts the runner and re-fetches.
