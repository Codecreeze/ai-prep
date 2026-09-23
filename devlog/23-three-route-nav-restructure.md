# 23 — Three-Route Navigation Restructure

**Files:** `src/app/(dashboard)/kits/page.tsx`, `kits/all/page.tsx` (new),
`kits/analytics/page.tsx`, `src/components/kits/KitsTable.tsx` (new),
`src/components/nav/Sidebar.tsx`, `MobileNav.tsx` — removed `KitList.tsx`,
`KitCard.tsx`, `KitListEmptyState.tsx` (superseded, deleted rather than left unused)

## What
Split what had been a single `/kits` page doing three jobs into three genuinely
separate routes with a clear division of responsibility:
- **Analyze** (`/kits`) — the create-kit workflow: the form, plus the 5 most
  recently created kits as a glance-back, no stat cards.
- **Kits** (`/kits/all`) — the full, persisted record of every kit the user has
  ever generated, as a real data table (not cards), with search and delete.
- **Analytics** (`/kits/analytics`) — unchanged: stat cards, status chart, recent
  activity.

## Why
Direct feedback: the previous `/kits` page conflated "the page I use to create a
new kit" with "the page that shows me every kit I've made," which don't actually
serve the same moment — one is a workflow you visit to start something, the other
is a record you consult to find something you already made. Splitting them mirrors
how the reference admin dashboard treats "create/act" pages differently from
"browse everything" pages (a table), and matches the specific structure asked for.

## How
- `KitsTable` is a genuine `<table>` (not a card grid) — columns for Role, Company,
  Status, Created, Actions. This is deliberately table-shaped, not another card
  layout, because a table is the correct UI for "scan many records by column,"
  where the card grid on Analyze's "recent 5" is correct for "glance at a
  handful." Different jobs, different components — not the same list component
  reused with a `limit` prop, because their actual layouts genuinely differ.
- `RecentKitsList` (already built for Analytics) is reused as-is on Analyze — it
  was already exactly "top 5 most recent, compact," so no new component was needed
  there; only the *table* was genuinely new work.
- `/kits/all` as a route name (not `/kits/list` or similar) was chosen to avoid
  any ambiguity with `/kits/[id]` — Next.js resolves static segments (`all`,
  `analytics`) ahead of the dynamic `[id]` segment automatically, so there's no
  actual routing conflict, but a short, unambiguous static name reads clearly in
  the sidebar and the URL bar either way.
- Deleted `KitList`, `KitCard`, `KitListEmptyState` outright rather than leaving
  them as unused dead code (Rules/03) — `KitsTable` fully supersedes what they did.

## Verified
Live-tested all three routes end to end: `/kits` (Analyze) shows the create form
and a "Generating..." kit in the recent-5 list immediately after submission, no
stat cards present; `/kits/all` (Kits) renders the real table with correct columns
and the kit's actual `ready` status and creation date once generation finished;
`/kits/analytics` unchanged and still correct. Sidebar and mobile drawer both show
all three items with correct active-state highlighting per route. `tsc`/`lint`
clean, 76 tests still passing (no logic changed — this was routing/composition
only, and none of the deleted components had their own dedicated tests to lose).
