# 13 — Visual Design Pass

**Files:** `src/app/globals.css`, `src/components/ui/*` (new: `Button`, `Card`,
`Badge`, `TextField`, `TextAreaField`, `ErrorText`, `Spinner`),
`src/components/auth/AuthLayout.tsx` (new), all auth/dashboard/kit components restyled

## What
Replaced the initial default-Tailwind styling (unstyled borders, black-on-white,
browser-default button) with an actual design system: a small deliberate color
palette (indigo primary, slate neutrals, semantic status colors), a set of reusable
UI primitives, and every existing component restyled to use them consistently.

## Why
Pradeep called this out directly and correctly — the first pass was functionally
complete but visually looked like a bare HTML form, not a product. The brief
explicitly scores this: "The interface carries real weight in this assessment. We
are looking at how you build it, not only that it exists," plus a dedicated 10-point
"interaction design" line in the human-review rubric. Functional-but-ugly was a real
gap, not a nitpick, so this got its own pass rather than being folded in as an
afterthought.

## How

**Design tokens (`globals.css`)** — a small named palette (`--background`,
`--surface`, `--foreground`, `--muted`, `--border`, `--primary`,
`--primary-hover`) registered via Tailwind v4's `@theme inline`, so they're usable
directly as utilities (`bg-primary`, `text-muted`, `border-border`) everywhere,
with light/dark variants defined once. This is what makes the whole app read as one
system instead of every component picking its own ad hoc gray — a direct DRY
argument, not just a visual one.

**UI primitives (`components/ui/`)** — `Button` (variant-based: primary/secondary/
ghost/danger), `Card`, `Badge` (tone-based, used for status pills and must/nice
tags), `TextField`/`TextAreaField` (label + input as one unit, consistent focus
rings), `ErrorText`, `Spinner`. Every form, card, and status indicator in the app now
goes through these instead of repeating long Tailwind class strings per component —
changing the look system-wide is now a one-file edit, not a find-and-replace across
a dozen components.

**`AuthLayout`** — a split-panel layout (branded indigo panel + form) for login/
register, replacing "form floating alone on a white page." Collapses to just the
form on narrow viewports (`hidden lg:flex` on the branding half) rather than trying
to cram a split layout onto mobile.

**Dashboard shell** — sticky header with a logo mark, max-width content container,
consistent card-based sections throughout the kit detail view (company brief, role,
question bank, flashcards, schedule), color-coded badges (red for `must`, neutral for
`nice`; green "fully covered" vs. amber "N uncovered" on the question bank).

## Verified
Live-tested in browser at both desktop (1280px, confirms the split-panel auth layout
and multi-column dashboard) and mobile (375px, confirms cards stack correctly, the
header collapses sensibly — email hidden, logo + sign-out only) widths, logged in as
the same test account, viewing a real generated kit (Product Designer role, correctly
tagged must/nice requirements, "Fully covered" badge, real question content).
`npx tsc --noEmit` clean, 46 tests still passing (no component logic changed, purely
presentational).

## Trade-offs
- **A small custom palette via CSS variables vs. using Tailwind's stock color scale
  directly everywhere:** the token layer costs a little extra indirection but pays
  for itself the moment the brand color needs to change, or dark mode needs
  adjusting — one place to edit instead of hunting `indigo-600` across 15 files.
- **Hand-rolled UI primitives vs. a component library (shadcn/ui, etc.):** for the
  scope and timeline here, 7 small primitive files are faster to build, easier to
  explain line-by-line in an interview, and have zero extra dependency/bundle-size
  cost — a real component library would be the right call for a larger, longer-lived
  product, but is over-engineering for this assessment (Rules/03: no unnecessary
  dependencies).
