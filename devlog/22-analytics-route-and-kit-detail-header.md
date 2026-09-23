# 22 — Analytics as Its Own Route; Kit Detail Header

**Files:** `src/app/(dashboard)/kits/page.tsx`, `kits/analytics/page.tsx` (new),
`src/components/nav/Sidebar.tsx`, `MobileNav.tsx`, `src/components/kits/
KitDetailHeader.tsx` (new), `KitDetail.tsx`

## What
Two follow-up fixes from direct feedback on the previous redesign pass:
1. Analytics moved from an in-page tab on `/kits` to its own route,
   `/kits/analytics`, with a second sidebar nav item — not two views sharing one
   URL.
2. The kit detail page (`/kits/:id`) got the same page-header treatment as the
   dashboard: a breadcrumb back-link, a real `<h1>` title, and a status badge,
   instead of just a floating "Practice flashcards" button above a stack of cards.

## Why
Tabs-on-one-page and separate-routes are genuinely different navigation patterns
with different trade-offs (tabs: no new URL, state lost on refresh unless synced to
the URL; routes: bookmarkable, browser back/forward works naturally, matches how
the reference site's own "Overview/Customers/Products/Settings" top nav behaves —
those are real routes, not tabs, in the reference too, on closer inspection).
Given the explicit ask, routes are the correct match here — and they're also
simply more correct for this app: Analytics is not "another view of the same data
you were just editing," it's a genuinely separate concern from the create-kit
workflow, which is exactly the case for a distinct URL rather than a tab.

## How
- `/kits/page.tsx` is back to just Overview content (stats + create form + list) —
  the `Tabs` component from the previous pass is now unused, so it was deleted
  rather than left as dead code (Rules/03).
- `/kits/analytics/page.tsx` is a new, genuinely separate page: its own stats
  cards, the status chart, and recent activity. Next.js resolves the static
  `analytics` segment ahead of the dynamic `[id]` segment automatically, so this
  coexists with `/kits/:id` without any routing conflict or special-casing needed.
- `Sidebar` and `MobileNav` both gained a second nav entry; `Sidebar`'s active-state
  highlighting now compares `pathname` against each nav item's `href` in a loop
  instead of hardcoding a single "is this the kits page" check.
- `KitDetailHeader` is a new, small component (title + status badge + breadcrumb +
  the practice-mode button, previously floated in `KitDetail` itself) — pulled out
  as its own file both because it's a genuinely separate visual/logical unit and
  because it makes `KitDetail` read more clearly as "header, then five kit
  sections" rather than mixing header markup into the section list.

## Verified
Live-tested: `/kits` shows Overview content with no tabs; `/kits/analytics` loads
as its own page showing real counts (1 ready kit, correctly reflected in the chart
and recent-activity list); the sidebar shows both "Kits" and "Analytics" as
separate links; the kit detail page now shows "← Back to Dashboard", the role title,
a "ready" status badge, and the practice button in a proper header row, consistent
with the dashboard pages' own heading style. `tsc`/`lint` clean, 76 tests still
passing (no logic touched, only navigation structure and one page-header
component).
