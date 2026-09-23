# 21 — Admin Dashboard Redesign

**Files:** `src/app/globals.css`, `src/lib/theme.ts`, `src/lib/uiSlice.ts`,
`src/lib/store.ts`, `src/components/theme/ThemeToggle.tsx`,
`src/components/nav/{Sidebar,SidebarToggle,MobileNav,Topbar,TopbarSearch,UserMenu}.tsx`,
`src/components/kits/{KitStatsCards,KitsStatusChart,RecentKitsList}.tsx`,
`src/components/ui/Tabs.tsx`, `(dashboard)/layout.tsx`, `(dashboard)/kits/page.tsx`

## What
A full redesign of the dashboard shell from a plain top-header layout to a real
admin-dashboard pattern: collapsible sticky sidebar (desktop) / slide-over drawer
(mobile), a topbar with a working search box, a light/dark theme toggle, a user
account menu, and a two-tab Dashboard page (Overview / Analytics) with a real-data
status chart and recent-activity list. Also fixed a genuine bug: interactive
elements weren't reliably showing a pointer cursor.

## Why
Direct feedback: the previous pass was functionally complete but still read as
under-designed for what the brief calls "how you build it, not only that it
exists." Pradeep pointed at a specific, well-known reference
(themewagon.github.io/shadcn-admin) and asked for the same structural pattern —
sidebar, topbar, search, sticky collapse, analytics — not just "make it prettier."

## How

**Reference audit, not guesswork:** read the reference site's actual accessibility
tree (not just a screenshot) before building anything, to get its real structure
right: a sidebar with a collapse toggle appearing in two places, a topbar with its
own toggle + search + theme + avatar, and a tabbed dashboard body with stat cards,
a chart, and a "recent" list. Matched that *pattern* — sidebar/topbar/tabs/chart/
recent-list — without inventing fake nav items (the reference's "Tasks/Apps/Chats/
Users" are demo-app filler; this app only has one real section, "Kits," so the
sidebar has one real link, not four fake ones).

**Cross-tree state via a Redux slice, not prop drilling** (`uiSlice.ts`): sidebar
collapse and the search query both need to be read by components in different
subtrees (the topbar lives in the layout; the kit list it filters lives in the page
children) — exactly the case Rules/02 reserves for a slice instead of threading
props more than 3 levels.

**Theme toggle, effect-free:** `themeInitScript` runs as a blocking inline script in
`<head>` (before React hydrates) to apply any stored theme immediately, avoiding a
light-then-dark flash. `ThemeToggle` itself reads the already-applied theme via a
lazy `useState` initializer (`useState(() => isDarkActive())`) rather than
`useEffect` — the initializer runs synchronously during the client's first render,
after the inline script has already set the DOM attribute, so no reactive sync step
is needed. `suppressHydrationWarning` covers the one-render gap between the
server's theme-less markup and the client's real value — the same pattern
`next-themes` uses internally, hand-rolled here to avoid adding that dependency for
what's ultimately a ~40-line feature.

**Sidebar collapse + mobile drawer:** collapse state lives in the same `uiSlice`
(desktop-only, `md:` breakpoint); the mobile drawer (`MobileNav`) is separate,
local `useState` (`open`/`closed`) since it's genuinely local to that one
component and not shared elsewhere. `Sidebar` itself is `sticky top-0 h-screen`,
matching the reference's persistently-visible-while-scrolling behavior.

**Real search, not decorative:** `TopbarSearch` dispatches into `uiSlice`;
`KitList` reads the same query and filters by role/company substring match. Present
everywhere in the topbar (matching the reference's placement) but only meaningfully
filters on the one page that has a list to filter — harmless no-op elsewhere,
rather than building page-aware conditional rendering for a difference that doesn't
matter in practice.

**Analytics tab — real data only:** `KitsStatusChart` is a hand-rolled inline-SVG/
CSS bar chart (no charting library pulled in for three bars — Rules/03) over actual
kit-status counts from the same `useListKitsQuery` cache the stat cards use; `
RecentKitsList` shows the user's own 5 most-recently-created kits. Deliberately not
fabricated placeholder numbers the way the reference's own demo data is (its
"$45,231.89 Total Revenue" is decorative demo content) — every number here is real.

**Cursor-pointer fix:** root cause was simpler than expected — no component was
overriding cursor, but nothing was explicitly setting it either, and the
combination of Tailwind Preflight + this browser/OS rendering left buttons at the
default arrow cursor. Fixed once, globally, in `globals.css`
(`button:not(:disabled), a, [role="button"], select { cursor: pointer }`) rather
than adding `cursor-pointer` to every individual component — one CSS rule instead
of N repeated utility classes, and it automatically covers every future button too.

## Verified
Live-tested end to end: desktop (1280px) — sidebar collapse toggle works (full ↔
icon-only), Overview/Analytics tabs both render correctly, stat cards show real
zero-state counts. Dark theme — toggled live, teal palette holds up well against the
dark navy surface tokens, sidebar/topbar/cards all correctly re-themed. Mobile
(375px) — stat cards reflow to 2 columns, search correctly hidden at narrow widths
(`sm:flex`) rather than cluttering the topbar, hamburger opens the slide-over drawer
with the real "Kits" link. Cursor fix confirmed via `getComputedStyle` in the
browser: both a button and a link report `cursor: pointer`. `npx tsc --noEmit` and
`npm run lint` both clean; all 76 tests still passing (no component *logic*
changed, this pass was structural/presentational).

## Trade-offs
- **One real sidebar nav item vs. padding the sidebar with placeholder sections:**
  chose honesty over visual density — the reference has 8 nav items because it's a
  generic admin template; this app has one real page beyond the dashboard itself
  (kit detail pages are reached via cards/rows, not top-level nav). Adding fake nav
  items to "look fuller" would be exactly the kind of fabrication the brief
  penalizes elsewhere (inventing content that isn't there) — even if here it's UI
  chrome, not kit data, it's the same instinct to resist.
- **Hand-rolled dropdown/drawer overlays (invisible full-screen button to close) vs.
  a floating-UI/headless-UI library:** simpler for two small menus, and — like the
  theme toggle — avoids a dependency for a small, self-contained interaction;
  would reconsider if more than two or three of these existed in the app.
