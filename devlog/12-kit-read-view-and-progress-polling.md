# 12 — Kit Read View & Progress Polling (Phase 6, part 2)

**Files:** `src/lib/api/kitsApi.ts`, `src/components/kits/CreateKitForm.tsx`,
`KitList.tsx`, `KitCard.tsx`, `KitDetail.tsx`, `KitProgressBanner.tsx`,
`sections/CompanyBriefSection.tsx`, `RoleSection.tsx`, `QuestionBankSection.tsx`,
`FlashcardsSection.tsx`, `ScheduleSection.tsx`,
`src/app/(dashboard)/kits/page.tsx`, `kits/[id]/page.tsx`, `src/app/page.tsx`

## What
The kit-creation form, the kit list (with its own polling so in-progress kits update
without a manual refresh), and the full read-only kit view — company brief, role
breakdown, question bank grouped by category, flashcards, and schedule — plus a
progress banner shown while a kit is still generating.

## Why
This is the "watch the kit being generated, with visible progress" and "read a
company brief, a role breakdown, a categorised question bank, flashcards and a study
schedule" requirements from the brief's Application Overview. Read-only first,
deliberately — the Builder (edit/reorder/regenerate) is the next slice, and building
read-then-edit in that order meant there was a working, verifiable display of real
kit data before adding the harder state-management problem on top of it.

## How
Each kit section is its own component (`CompanyBriefSection`, `RoleSection`, etc.),
per Rules/01's one-component-per-file rule, and each takes only the slice of the kit
it needs as props rather than the whole kit object — keeps each one simple to reason
about and easy to reuse once the Builder needs editable versions of the same
sections. `QuestionBankSection` groups questions by category with a plain reduce at
render time (no state, no effect — it's a pure derivation of props).

`kitsApi.ts` re-uses the `Kit` TypeScript type from `src/server/validation/kitSchema.ts`
via `import type` — meaning the client gets the exact same shape guarantee the Zod
schema already enforces server-side, with zero duplication, and (because it's a
type-only import) none of that module's runtime server code crosses into the client
bundle.

## Polling — what didn't work, and what did

First attempt: two `useGetKitQuery(id)` subscriptions — one bare, to read the current
status, and a second with `pollingInterval` computed from that status (so polling
would stop itself once `status !== "pending"`). Verified in the browser this **did
not reliably trigger repeated fetches at all** — network logs showed only the
single initial fetch, no follow-up polls, even minutes later.

Second attempt (still broken): switched to a single subscription with a static
`pollingInterval: 4000` plus `skipPollingIfUnfocused: true` (RTK Query's built-in
"don't poll a backgrounded tab" option). Still zero repeat fetches. Diagnosed by
directly comparing network logs with and without that flag — removing it alone fixed
polling immediately. Root cause: the automated test browser reports the tab as
unfocused via the Page Visibility API, which `skipPollingIfUnfocused` respects — so
in this environment it silently disabled polling entirely, not just when genuinely
backgrounded.

**Final, verified-working version:** a single `useGetKitQuery(id, { pollingInterval:
4000 })`, nothing else. Confirmed via network logs: repeated `GET
/api/kits/:id` calls roughly every 4 seconds while the page stays open.

## Trade-offs
- **Static polling interval (doesn't stop once `status: "ready"`) vs the
  self-stopping two-subscription version:** chose the version that's proven to
  actually work over the "smarter" one that silently didn't. The cost is a small,
  ongoing 4s poll even after a kit is done, for as long as that page stays open —
  acceptable (cheap GET, ownership-scoped, no LLM cost) versus the alternative of
  shipping progress UI that might not update at all in some browser/focus states.
  Worth revisiting later with `useEffect`-based cleanup if this needs tightening, but
  that would be the first case in this codebase where `useEffect` is the pragmatic
  answer (reacting to a genuinely external, asynchronous condition — server-side job
  completion — is closer to the "subscribing to an external system" carve-out in
  Rules/01 than to component-internal state logic).
- **Removed `skipPollingIfUnfocused` rather than only using it in production:**
  simpler to reason about with one code path than to special-case dev/test
  environments, and the downside (continuing to poll a backgrounded real-user tab) is
  minor for this app's scale.
- Section components take narrow props instead of `kit: Kit` — slightly more prop
  plumbing at the call site (`KitDetail.tsx`), but each section component is now
  trivially testable/reusable in isolation, including for the Builder's eventual
  editable variants.
