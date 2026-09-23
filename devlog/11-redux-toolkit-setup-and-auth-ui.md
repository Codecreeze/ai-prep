# 11 — Redux Toolkit Setup & Auth UI (Phase 6, part 1)

**Files:** `src/lib/store.ts`, `hooks.ts`, `api/apiSlice.ts`, `api/authApi.ts`,
`src/app/providers.tsx`, `src/app/layout.tsx`, `src/components/auth/LoginForm.tsx`,
`RegisterForm.tsx`, `src/app/(auth)/login/page.tsx`, `register/page.tsx`,
`src/app/(dashboard)/layout.tsx`, `src/components/nav/LogoutButton.tsx`

## What
The Redux Toolkit + RTK Query wiring (one store, one API slice, typed hooks), the
login/register forms, and the dashboard's server-side auth gate.

## Why
Rules/02 settled on Redux Toolkit + RTK Query for both client and server state (see
the earlier `devlog` discussion in the RTK-Query-vs-Zustand+TanStack-Query
conversation) — this is that decision actually implemented. The auth gate is a
server component check, not client-side, specifically so a signed-out visitor never
even receives the protected page's HTML — satisfying the brief's "a signed-out
visitor cannot reach protected pages" requirement more strongly than a client-side
redirect-after-mount would (which would still ship the page's JS bundle and briefly
flash content before redirecting).

## How

**`apiSlice.ts`** — one `createApi` instance for the whole app, `credentials:
"include"` so the httpOnly session cookie rides along automatically with every
request, no manual header wiring. `authApi.ts` and (next entry) `kitsApi.ts` both
`injectEndpoints` into this same slice rather than creating separate `createApi`
instances — keeps one shared cache/store instead of fragmenting RTK Query state
across multiple unrelated API objects.

**`Providers` (`app/providers.tsx`)** — the *only* client-component boundary needed
for Redux; everything else (layouts, pages) stays a Server Component by default,
per Rules/01's "no unnecessary client components."

**Auth forms** — plain `useState` per field, submit handler calls the RTK Query
mutation, `.unwrap()` to get a real rejected promise on failure (RTK Query mutations
don't throw by default — `.unwrap()` opts into that so a normal `try/catch` works).
No `useEffect` anywhere: nothing here needs to react to an external system, only to
user-initiated events, which is exactly what Rules/01 asks for.

**Dashboard auth gate (`(dashboard)/layout.tsx`)** — an `async` Server Component that
calls `getCurrentUser()` (same helper the API routes use) and `redirect("/login")`
before rendering anything if there's no valid session. This is also where the sign-out
button and the shared header live, so every page under `(dashboard)/` gets them for
free instead of each page re-implementing a header.

## Verified
Live-tested in the browser end to end: `/` → redirects through `/kits` → `/login`
(confirms the auth gate actually blocks); logged in as the test user created during
Phase 5's live verification; redirected correctly to `/kits` on success, header shows
the signed-in email. `npx tsc --noEmit` and `npm run lint` both clean (2 trivial
unused-var warnings in test files found and fixed, zero errors).

## Trade-offs
- **`credentials: "include"` globally vs per-request:** simpler and correct here since
  every API call in this app needs the session cookie — no endpoint is meant to be
  called cross-origin/without auth context, so there's no case where this would be
  wrong to apply blanket.
- **Server-side auth gate vs a client-side `useEffect` + redirect:** strictly better
  for both security (no protected HTML/data ever reaches an unauthenticated client)
  and Rules/01 compliance (no `useEffect` needed at all) — there wasn't really a
  competing approach worth choosing here once Next.js Server Components were already
  the architecture.
