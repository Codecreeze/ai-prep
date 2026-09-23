# 28 — Pagination, Tooltip, and Row-Actions Redesign

**Files:** `src/lib/paginationRange.ts` (new), `src/components/ui/{Pagination,
Tooltip}.tsx`, `src/components/kits/KitRowActions.tsx` (new), `src/components/kits/
KitsTable.tsx`, `src/components/theme/ThemeToggle.tsx`, `src/components/nav/
{SidebarToggle,UserMenu}.tsx`

## What
Two reference images provided directly: a numbered-pill pagination control
("Showing 1-10 of 1000" + `‹ 1 2 [3] … 100 ›`) and a kebab-menu (⋮) row-actions
dropdown with "Show"/"Delete". Rebuilt both to match, plus replaced the earlier
native-`title` tooltips (flagged as "just a dummy") with a real styled tooltip
component.

## Why
The previous pagination was a bare "Previous / Next" pair with no page numbers or
count — functional but not what was asked for. The previous row action was a lone
text "Delete" button — no room to add more actions later, and not matching the
reference's kebab-menu pattern. Native `title` tooltips are real but low quality:
slow to appear, unstyled, browser-inconsistent, easy to dismiss as "not really a
tooltip."

## How

**`paginationRange` (pure function, tested)** — always shows page 1, the last page,
and a small window around the current page, collapsing any gap into a single
`"ellipsis"` token. Kept as a standalone pure function (not inlined into the
component) specifically so it could be unit-tested directly — 5 tests covering the
short-list case, the "near the start" and "near the end" cases (only one ellipsis,
not two), and the interior case (ellipsis on both sides).

**`Pagination`** — "Showing X-Y of Z" computed from `page`/`pageSize`/`total` (not
just the current page's row count, so it's accurate even on a partial last page),
plus a single bordered pill container with divided buttons: chevron-left, the
`paginationRange` tokens (active page gets the `primary-soft` background from the
existing design tokens), chevron-right — directly matching the reference's visual
grouping.

**`KitRowActions`** — a kebab button (reusing the same overlay-click-to-close
dropdown pattern already used in `UserMenu`, so there's one established idiom for
"small dropdown menu" in the codebase, not two different implementations) with
"Show" (navigates to the kit) and "Delete" (styled in red, opens the existing
confirm dialog rather than deleting directly — the confirm-before-destructive-action
rule from devlog/25 still applies here, the kebab menu doesn't bypass it).

**`Tooltip`** — CSS-only (`group-hover`/`group-focus-within`), not a portal or a
JS-positioned library: a tooltip is `position: absolute` relative to its own
trigger, which — unlike `Modal`/`MobileNav`'s `position: fixed` — never hits the
ancestor-`backdrop-blur`-containing-block issue from devlog/26, so no dependency or
portal was needed for something this self-contained. Applied to every icon-only
button that previously relied on native `title`: theme toggle, sidebar toggle, the
new row-actions kebab, and the account-menu avatar (which now shows the user's
actual email on hover, more useful than a generic "Account menu" label).

## Verified
Live-tested against the 12 remaining seeded kits: `/dashboard/kits` showed the
kebab icon in the Actions column (not a bare "Delete" link); clicking it opened a
dropdown with "Show" and a red "Delete", matching the reference image; hovering the
kebab showed a proper dark, animated tooltip reading "Actions"; the pagination
footer read "Showing 1-10 of 12" with numbered page buttons "1 2" (only 2 pages at
this kit count, so no ellipsis was expected or shown — the ellipsis logic itself is
covered separately by the 5 unit tests). `tsc`/`lint` clean, 81 tests passing (5
new, for `paginationRange`).
