# 29 — Scroll-Shell Rework, Tooltip Alignment, and a Practice Hub

**Files:** `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`, `src/components/
{nav/Sidebar,auth/AuthLayout}.tsx`, `src/components/ui/Tooltip.tsx`, `src/components/
nav/{UserMenu,CommandPalette,MobileNav}.tsx`, `src/components/kits/{KitRowActions,
KitsTable}.tsx`, `src/components/practice/{PracticePage,PracticeHub,PracticeKitCard}.tsx`
(2 new), `src/app/dashboard/practice/page.tsx` (new)

## What
Four issues reported together, all rooted in the same two causes: (1) tooltips
rendering above their trigger and centered on it, (2) the page shell letting the
whole `<body>` scroll instead of just the main content. Also added a "Practice"
row action to the Kits table's kebab menu, and a new top-level Practice hub page
(a 4th nav item, below Analytics) listing every ready kit with its readiness score.

## Why
**Tooltip positioning** — `Tooltip` always opened `bottom-full` (above the trigger)
and centered horizontally. For header controls sitting right at the top of the
viewport, "above" has almost no room — the tooltip either got visually clipped or
looked like it belonged to the wrong element. For edge-anchored triggers (the
account avatar, a table row's kebab button, both near the right edge), horizontal
centering pushed the label's right side past the viewport, actually widening the
page (see next bug).

**Horizontal scrollbar + sidebar scrolling with the body** — the shell had no
dedicated scroll container: `<body>` was `min-h-full` with no `overflow` set, so
the *whole page* was the scrolling element. That has two consequences: any element
that visually overflows the viewport (like the mispositioned tooltip above) grows
`document.body.scrollWidth` and produces a real horizontal scrollbar, and the
sidebar — `sticky top-0` relative to that same scrolling body — scrolls out of
view with everything else instead of staying pinned, because `position: sticky`
only stays put relative to *its own* scroll container, and here that was the
whole page.

## How

**Tooltip** — added `side` ("top" | "bottom", default now `"bottom"`) and `align`
("center" | "end", default `"center"`) props instead of hardcoding one position.
Every existing call site keeps its default (opens below, centered) except the two
that sit at the right edge of their row — `UserMenu`'s avatar and `KitRowActions`'
kebab — which now pass `align="end"` so the label's right edge lines up with the
trigger's right edge instead of overflowing past it.

**Scroll shell** — `<body>` is now `h-full overflow-hidden` (never scrolls itself).
`dashboard/layout.tsx`'s row is `flex-1 flex min-h-0`, and only `<main>` gets
`flex-1 min-h-0 overflow-y-auto` — it's the one true scroll container for page
content. `Sidebar` dropped `sticky h-screen` for a plain `h-full`: with nothing
above it scrolling anymore, a sticky position was never actually needed — the
sidebar simply lives in a non-scrolling flex row next to a `<main>` that scrolls
independently, so it's pinned by layout, not by `position: sticky` fighting a
scroll container it wasn't actually anchored to. `AuthLayout` (login/register,
which sits directly under the now-non-scrolling body with no dashboard shell
wrapping it) got its own `overflow-y-auto` so a tall form on a small screen still
has somewhere to scroll.

**Practice row action + hub page** — `KitRowActions` now takes a `status` prop and
shows a "Practice" item (linking to `/dashboard/kits/:id/practice`) between Show
and Delete, but only for `status === "ready"` kits — practicing an unfinished kit
has no flashcards to show. A new `/dashboard/practice` route (4th sidebar/mobile-
nav/command-palette item, right after Analytics) lists every ready kit as a card
with its live readiness score (`PracticeKitCard`, one small `useGetReadinessScoreQuery`
subscription per card — reusing the existing per-kit endpoint rather than adding a
new bulk one) and a "Practice" button straight into that kit's session.

**Practice page width** — `PracticePage` previously wrapped everything (header
included) in `max-w-3xl mx-auto`, which is why it read as noticeably narrower than
every other dashboard page. Split it: the header (back link + title + subtitle)
is now full-width like `KitDetailHeader` and the other pages, and only the actual
session content (readiness card, coverage bar, flashcard runner) stays in an inner
`max-w-3xl` column for readability — matches the rest of the app's visual rhythm
while keeping flashcard text from stretching edge-to-edge.

## Addendum: route moved under `/dashboard/practice`, page widened
Two follow-up fixes on the same feature, right after live review:

**Route** — the per-kit practice page lived at `/dashboard/kits/:id/practice`,
which put it under the Kits section even though it now has its own top-level nav
item. Moved the route to `/dashboard/practice/:id` (`src/app/dashboard/practice/
[id]/page.tsx`, old `kits/[id]/practice` folder removed) so the URL matches where
it actually lives in the nav. Updated every link that pointed at the old path
(`KitDetailHeader`'s "Practice flashcards" button, `KitRowActions`' kebab item,
`PracticeKitCard`'s hub link) and extended `Sidebar`'s active-route check so
"Practice" also stays highlighted on `/dashboard/practice/:id`, the same pattern
already used for "Kits" and its own `:id` sub-pages.

**Width** — the page still wrapped its content in `max-w-3xl`, which on a wide
screen left most of the page empty (visible in the reference screenshot). Rather
than stretching the flashcard itself edge-to-edge (which would just make a single
short sentence harder to read), it's now a `lg:grid-cols-3` layout: the flashcard
session runner takes the wider left column (2/3), and the readiness score +
coverage bar move into a right-hand sidebar column (1/3) — using the freed-up
width for genuinely useful information instead of just whitespace. Removed the
now-redundant `mb-6` from `ReadinessScoreCard` and `PracticeCoverageBar` (spacing
is handled by the new grid's `gap-6` instead) after confirming both components are
only used on this page.

## Verified
Live-tested against a freshly registered account seeded with the same 13-kit
fixture: `document.body.scrollWidth === window.innerWidth` (no horizontal
overflow) and `document.body` never scrolls (`overflowY: hidden`, `scrollTop`
stays `0`) while `/dashboard/kits`' table still scrolled correctly within `<main>`.
Measured the theme-toggle tooltip's `getBoundingClientRect()` directly: it now
opens *below* its trigger and stays fully inside the viewport; the account-avatar
tooltip (right-aligned) also stays inside the viewport instead of bleeding off the
right edge. Kebab menu on the Kits table now shows Show/Practice/Delete. The new
`/dashboard/practice` hub loaded all 13 seeded ready kits with live 40% readiness
scores and working Practice links. The per-kit Practice page's header now measures
the same width (1040px) as the Kits table header, with session content correctly
narrower inside it. `tsc --noEmit` and `npm run lint` both clean, 81/81 tests
still passing (no logic under test changed in this batch).

After the route/width addendum: re-verified live — `/dashboard/practice/:id` now
resolves correctly, the sidebar's "Practice" item stays highlighted on it, and the
page fills the full content width with the flashcard on the left and readiness/
coverage in a right sidebar column instead of a narrow centered box. `tsc`/`lint`
clean, 81/81 tests still passing.

## Addendum 2: mobile drawer had no active-item styling
`MobileNav` never called `usePathname()` at all — its nav items were rendered with
one static class string, so nothing ever looked "active" in the mobile drawer,
unlike the desktop `Sidebar`. Added the same `usePathname()` + active-route check
used in `Sidebar` (Kits/Practice stay highlighted on their `:id` sub-pages, the
rest are exact matches) and applied `bg-primary-soft` to the current item. Live-
verified at a 375×812 mobile viewport: opening the drawer from `/dashboard/kits`
now shows "Kits" highlighted with the teal active background, matching desktop.

## Addendum 3: shared loading state, and `npm run check`
Every page-level loading spot (`KitsTable`, `KitDetail`, `PracticeHub`, and
`PracticePage`) had drifted into its own small inline `<Spinner /> Loading X...`
row, left-aligned inside whatever container happened to hold it rather than
centered in the available space — most visible on `PracticePage`, where the
loading row sat inside the narrow 2/3 grid column instead of the page. Replaced
all four with a new shared `LoadingState` component (`src/components/ui/
LoadingState.tsx`): icon-only (no "Loading X..." text — a spinner alone already
reads as loading, the repeated phrase per page added noise, not information),
bigger (`size-8` instead of the button-spinner's `size-4`), and centered with
`flex items-center justify-center py-20` so it centers in whatever box it's
placed in rather than hugging a corner. `PracticePage` additionally shows the
loading state at full page width (before the two-column grid renders) rather than
nested inside the left column, so it's centered on the actual page, not a
lopsided sub-region of it. Left button-inline spinners (register/login/create-kit
submit buttons, `RegenerateButton`) alone — those are a different, deliberate
pattern (a small icon next to button text showing an action is in flight), not
this "waiting for a page's data" pattern.

Also added `npm run check` (`lint && typecheck && test && build`, plus a new
standalone `npm run typecheck`) as one command to validate everything before a
commit or the final submission, instead of running each check separately.

Live-verified: caught `/dashboard/practice` and a per-kit practice page mid-load
in the browser — spinner is visibly larger, has no text, and sits centered in the
page/column. `npm run check` passes end to end: lint clean, `tsc --noEmit` clean,
81/81 tests passing, and `next build` completes with all 32 routes generated
correctly (including the moved `/dashboard/practice/[id]`, with no stray
`/dashboard/kits/[id]/practice` route left over).
