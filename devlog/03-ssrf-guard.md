# 03 — SSRF Guard (URL Validator)

**File:** `src/server/retrieval/urlValidator.ts`

## What
`assertUrlIsSafe(url)` — validates a URL before it's ever fetched: rejects
non-http(s) protocols, and in production, resolves DNS and rejects any address that
lands in a private/loopback/link-local range (10.x, 172.16-31.x, 192.168.x, 127.x,
169.254.x, ::1, fc00::/7, fe80::/10).

## Why
Section 11 of the brief ("Security") requires: "Validate external URLs before
fetching them, and reject private and loopback addresses in production." This app
fetches a URL the user typed in (company website) and then follows links found on
that page — both are attacker-influenceable input. Without this guard, someone could
point the app at `http://169.254.169.254/...` (a common cloud metadata-service SSRF
target) or an internal service and use the app as a proxy to reach it.

## How
- DNS is resolved (not just string-matched on the hostname) because the real SSRF
  risk is the *resolved IP*, not the hostname text — a malicious actor could use a
  public-looking hostname that resolves to a private IP (DNS rebinding).
- Gated behind `ALLOW_LOCAL_URLS` (default off / production-safe). The batch grading
  harness explicitly serves company sites from `http://localhost:8099/...` (Appendix
  B example), so a blanket "always block localhost" would break the mandatory batch
  command. The env flag makes this an explicit, documented opt-in for local/batch
  runs rather than a silent exception baked into the guard itself.

## Trade-offs
- **DNS-resolution check vs a simpler string-based blocklist** (`hostname ===
  'localhost'`, IP starts with `127.`, etc.): the string check alone misses DNS
  rebinding attacks and any hostname that merely *resolves* to a private range.
  Resolving DNS first is the correct approach and isn't meaningfully more complex, so
  there's no real trade-off here — it's just the right implementation.
- **Single env flag vs an allowlist of specific local hosts:** an allowlist (e.g.
  "only `localhost:8099` is permitted") would be more precise, but adds config
  surface for a case that only matters in two contexts we fully control (local dev,
  and the batch command run against Trao's own test fixtures) — a coarse env toggle
  is simpler and sufficient (YAGNI/KISS per Rules/03), and production deploys simply
  never set `ALLOW_LOCAL_URLS=true`.
