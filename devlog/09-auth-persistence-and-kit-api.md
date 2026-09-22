# 09 — Auth, Persistence & Kit API (Phase 5)

**Files:** `src/server/persistence/db.ts`, `models/User.ts`, `models/Kit.ts`,
`dedupeHash.ts`, `src/server/auth/password.ts`, `session.ts`, `getCurrentUser.ts`,
`requireUser.ts`, `src/server/http/apiError.ts`,
`src/server/pipeline/generateKitAsync.ts`, `src/app/api/auth/*`, `src/app/api/kits/*`

## What
MongoDB connection + models, password hashing + JWT-cookie session auth, and the Kit
API surface (create, list, detail, status polling, delete) — wired to fire the
Phase 4 orchestrator asynchronously so the create-kit request doesn't block for the
30-90+ seconds generation takes.

## Why
The brief's auth requirement is explicitly minimal ("email verification, password
reset and role hierarchies are out of scope"), so this implements exactly: register,
login, logout, own-kits-only access, sensible expired-session handling — nothing more.
The async-generation pattern exists because the brief itself flags it: "consider what
happens when it takes ninety seconds, fails halfway, or is triggered twice for the
same posting."

## How

**Auth** — `bcryptjs` hashes passwords (12 salt rounds). Sessions are a JWT signed
with `SESSION_SECRET`, stored in an HTTP-only, `sameSite: lax`, `secure`-in-production
cookie — no separate `sessions` collection, since nothing in scope needs server-side
session revocation (documented trade-off, see below). `requireUser()` is a shared
guard every protected route calls first, returning either the verified user or a
401 — avoids duplicating the cookie-check/401 logic across every route file (DRY).
Login returns the same `401 INVALID_CREDENTIALS` whether the email doesn't exist or
the password is wrong, so the endpoint doesn't leak which emails are registered.

**No Next.js edge `middleware.ts`** — deliberately skipped. `jsonwebtoken` needs
Node's `crypto` module, which the Edge runtime doesn't fully support; the
edge-compatible alternative (`jose`) would be a second JWT library just to run
verification in middleware instead of in each route handler (which already runs on
the Node runtime by default). Per-route `requireUser()` calls achieve the same
protection with one fewer dependency (KISS/YAGNI, Rules/03).

**Persistence** — `Kit.kit` and `Kit.editState` are stored as Mongoose `Mixed` rather
than a second fully-typed schema, because the Zod schema in
`validation/kitSchema.ts` already IS the source of truth for the Appendix A shape;
duplicating it as a parallel Mongoose schema would be two definitions to keep in sync
for zero benefit (DRY). `dedupeHash` (sha256 of normalized jd+companyUrl) implements
the brief's "same description and company submitted twice" edge case: the create-kit
route checks for an existing `ready` kit with the same hash for that user and returns
it instead of re-spending LLM quota on an identical run.

**`generateKitAsync`** — fire-and-forget after the kit doc is created with
`status: "pending"`; the API responds immediately (202) with the kit id, and the
frontend polls `/api/kits/:id/status` while it runs. This is an explicit, documented
scope cut (see `docs/ARCHITECTURE.md` §5): an in-process async function, not a
durable job queue (Redis/BullMQ). Acceptable here because expected load is a handful
of kits from one evaluator, not concurrent production traffic — a real production
version would need a durable queue so a crash mid-generation doesn't silently lose
the job, and that limitation is called out rather than hidden.

**Kit API routes** — `POST /api/kits` (create, dedupe-checked), `GET /api/kits`
(list, lean projection of just what a list view needs), `GET/DELETE
/api/kits/:id` (ownership-scoped: `findOne({_id, userId})`, and a kit that exists but
isn't the caller's returns `404`, not `403`, so the endpoint doesn't confirm which
kit ids exist for other users), `GET /api/kits/:id/status` (lightweight polling
projection, separate from the full kit fetch, so the frontend isn't re-downloading
the whole (potentially large) kit document every few seconds while it generates).

## Trade-offs
- **JWT-in-cookie vs a `sessions` collection:** a DB-backed session would allow
  server-side "log out everywhere" or forced invalidation. Not needed here (no such
  requirement in the brief, and the brief explicitly keeps auth minimal) — a stateless
  signed cookie is simpler and avoids a DB read on every authenticated request.
  Documented as a real limitation: if the `SESSION_SECRET` ever leaks, tokens can't be
  revoked before they expire (7-day window) — acceptable for an assessment project,
  would need reconsidering for production use.
- **Mixed-typed `kit`/`editState` fields vs a fully-typed Mongoose schema:** loses
  some Mongoose-level validation on write, but that's fine because every write path
  goes through `validateKit()` (Zod) before persisting — the validation already
  happens, just at the right layer instead of duplicated at two layers.
- **Update:** live-verified once `MONGODB_URI` was provided — see
  `devlog/10-live-db-verification-and-fixes.md` for the full round-trip test and two
  real bugs it caught and fixed (a Windows DNS/SRV connection issue, and an
  unawaited-promise issue with async kit generation). Both fixed before this phase
  was called done.
