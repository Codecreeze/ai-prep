import { assertUrlIsSafe } from "./urlValidator";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap — brief requires restricting size, avoids abuse via oversized responses
const TIMEOUT_MS = 10_000;
const ALLOWED_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

export type FetchResult =
  | { ok: true; html: string; finalUrl: string }
  | { ok: false; reason: string };

async function fetchOnce(url: string): Promise<FetchResult> {
  const safeUrl = await assertUrlIsSafe(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(safeUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "ai-interview-prep-kit-bot/1.0" },
    });
    if (!res.ok) return { ok: false, reason: `HTTP_${res.status}` };

    const contentType = res.headers.get("content-type") ?? "";
    if (!ALLOWED_CONTENT_TYPES.some((t) => contentType.includes(t))) {
      return { ok: false, reason: `UNSUPPORTED_CONTENT_TYPE: ${contentType}` };
    }

    const contentLength = Number(res.headers.get("content-length") ?? 0);
    if (contentLength > MAX_BYTES) return { ok: false, reason: "CONTENT_TOO_LARGE" };

    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > MAX_BYTES) return { ok: false, reason: "CONTENT_TOO_LARGE" };

    return { ok: true, html: Buffer.from(buffer).toString("utf-8"), finalUrl: res.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return { ok: false, reason: controller.signal.aborted ? "TIMEOUT" : message };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches one page with retry + exponential backoff. Never throws — callers treat
 * a failed fetch as "skip and report", per the brief's edge-case handling rule.
 */
export async function fetchPage(url: string, maxRetries = 2): Promise<FetchResult> {
  let lastResult: FetchResult = { ok: false, reason: "NOT_ATTEMPTED" };
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResult = await fetchOnce(url);
    if (lastResult.ok) return lastResult;
    if (lastResult.reason.startsWith("HTTP_4")) break; // 4xx won't succeed on retry
    if (attempt < maxRetries) await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
  }
  return lastResult;
}
