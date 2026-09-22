# 10 — Live DB Verification (and Two Real Bugs It Caught)

**Files touched:** `src/server/persistence/db.ts`, `src/app/api/kits/route.ts`,
`src/server/pipeline/generateKitAsync.ts`

## What
Once `MONGODB_URI` was available, ran the full Phase 5 flow against the real
deployed database via `curl`: register → login → create kit → poll status →
fetch full kit → list kits → delete kit, plus negative cases (401 without a
session, 404 on someone else's/nonexistent kit id). This is what turns Phase 5 from
"type-checks and unit-tests pass" into "actually works," per the project's
no-false-completion rule — and it surfaced two real bugs before they could ever reach
grading.

## Bug 1 — SRV DNS resolution failing on this Windows network

**Symptom:** every DB operation failed with `querySrv ECONNREFUSED
_mongodb._tcp.ai-prep.3ppoeqt.mongodb.net`, even though `nslookup` for the same SRV
record succeeded from the same machine.

**Diagnosis:** the OS-level resolver (what `nslookup` uses) and Node's internal
resolver are different code paths. Confirmed the network itself could do SRV lookups
fine (a raw `dns.resolveSrv()` call against `8.8.8.8` worked), which ruled out a
firewall/network block and pointed at something resolver-specific to how the MongoDB
driver does its own DNS resolution (it appears to use its own `dns.Resolver()`
instance internally, which — unlike the module's default resolver — does not inherit
a global `dns.setServers()` override).

**Fix:** rather than fight the driver's internal resolver, sidestepped SRV lookup
entirely — looked up the underlying shard hostnames (via `nslookup -type=SRV`) and
the replica set name (via the TXT record Atlas publishes alongside the SRV record,
`nslookup -type=TXT`), and rewrote `MONGODB_URI` from the `mongodb+srv://` form to
the standard `mongodb://host1,host2,host3/...?replicaSet=...` form, which needs no
SRV lookup at all. Did this via a small script that read the existing URI, extracted
credentials, and rewrote the line in `.env` — without ever printing the password to
chat, since that file holds real secrets.

**Why this is the right fix, not a workaround:** the standard connection string is an
officially supported Atlas connection method (Atlas's own UI offers it as an
alternative to the SRV form specifically for environments like this). It's not a
hack layered on top of the SRV form — it replaces it outright, so there's no ongoing
DNS-resolver fragility to carry forward.

## Bug 2 — async kit generation not reliably surviving the request lifecycle

**Symptom:** the first kit created via the API stayed `status: "pending"` /
`stage: "researching"` indefinitely — no error, no progress, nothing in the server
log.

**Diagnosis:** `generateKitAsync()` was called as a bare, un-awaited promise inside
the `POST /api/kits` route handler. Next.js (especially under serverless-style
execution, which dev mode partially emulates) can freeze or kill an unawaited
promise's execution once the response has been sent — the request's execution
context ends when the handler returns, and work that isn't explicitly kept alive
isn't guaranteed to keep running.

**Fix:** wrapped the call in Next.js's `after()` (from `next/server`), which exists
specifically for "run this after the response is sent, but keep the runtime alive
for it." Verified with a fresh kit end-to-end: create → `pending`/`researching` →
(~120s later) → `ready`, full valid kit content, matching schedule day count.

**Remaining known limitation (documented, not silently ignored):** `after()` protects
against the request/response lifecycle ending; it does NOT protect against the whole
Node process being killed mid-generation (which happened to an earlier test kit
during this same debugging session, when a dev-server restart was needed for the DNS
fix — that kit stayed permanently stuck and was manually deleted). This is the same
limitation already called out in `docs/ARCHITECTURE.md` §5 and
`devlog/09-auth-persistence-and-kit-api.md`: a durable job queue (Redis/BullMQ) would
survive a process restart; the current in-process approach doesn't, and that's an
accepted scope cut for this assessment's scale, not an oversight.

## Trade-offs / why this whole exercise mattered
- Both bugs would have been invisible from unit tests and type-checking alone — they
  only show up when the actual network (SRV DNS) and actual runtime lifecycle
  (request-scoped promise execution) are exercised for real. This is the concrete
  case for why "type-checks clean, tests pass" was explicitly NOT reported as "done"
  in devlog/09 until this live pass happened — the project's no-false-completion rule
  earned its keep here.
- Confirmed end-to-end: register, login, create (with dedupe-on-resubmit), status
  poll, full kit fetch (valid structure, correct schedule day count), list, delete,
  401 without a session, 404 on a nonexistent/foreign kit id. Full test suite
  (46 tests) still green after both fixes.
