# 24 — `/dashboard` URL Prefix

**Files:** moved `src/app/(dashboard)/**` → `src/app/dashboard/**`, added
`src/app/dashboard/page.tsx` (redirect to `/dashboard/analyze`), updated `src/app/
page.tsx` and every `Link`/`router.push` that pointed at a `/kits*` page route.

## What
Moved every dashboard page from a route *group* (`(dashboard)`, which doesn't
appear in the URL) to a real path segment (`dashboard`), so the three sections live
at `/dashboard/analyze`, `/dashboard/kits`, `/dashboard/kits/[id]`, `/dashboard/
kits/[id]/practice`, `/dashboard/analytics` — not bare `/kits/...` with no shared
prefix.

## Why
A route group's parentheses are a Next.js organizational convenience — they let
several routes share one layout without appearing in the URL. That's exactly the
wrong tool here: the request was for the URL itself to carry `/dashboard` as a
real, visible prefix, which only a genuine path segment does.

## How
File moves (`git mv`-equivalent), not new pages — no logic changed. `/dashboard`
itself (the bare path) redirects to `/dashboard/analyze` so there's a sensible
landing page if someone links straight to `/dashboard`. Every internal navigation
reference was updated: `Sidebar`/`MobileNav` hrefs, `CreateKitForm`'s post-create
navigation (later removed in favor of staying on-page — see devlog/25),
`KitDetailHeader`'s back-link and practice-mode link, `KitsTable`/`RecentKitsList`
row links, and both `LoginForm`/`RegisterForm`'s post-auth redirect. The backend API
routes under `src/app/api/kits/**` were deliberately left untouched — those are
server endpoints, not pages, and were never part of the `(dashboard)` route group
in the first place.

## Verified
`tsc`/`lint` clean, 76 tests still passing (pure routing change, no logic touched).
Live-confirmed: `/` redirects to `/dashboard/analyze` (307), `/dashboard` redirects
there too, and all in-app navigation (sidebar, kit cards, table rows, practice
button, auth forms) lands on the correct `/dashboard/...` URL.
