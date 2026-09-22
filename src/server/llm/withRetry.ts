export class RateLimitedError extends Error {}

// Matches both "the provider is throttling us" (429/rate-limit/quota) and "the
// provider is briefly down" (503/unavailable/overloaded) — the brief explicitly
// lists both as edge cases to survive ("rate-limits you, or briefly fails").
function isTransientError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /429|rate.?limit|quota|503|unavailable|overloaded|high demand/i.test(message);
}

/**
 * Exponential backoff + jitter around a flaky call. Retries transient provider
 * failures (rate limits, brief outages, network errors) so the pipeline survives a
 * single bad call instead of failing the whole kit. Does NOT retry a clearly
 * non-transient error (e.g. bad API key, malformed request) — those are rethrown
 * immediately since retrying them would only waste time.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const maxRetries = opts.maxRetries ?? 4;
  const baseDelayMs = opts.baseDelayMs ?? 1000;

  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = isTransientError(err) || err instanceof TypeError; // TypeError ~ fetch network failure
      if (!retryable || attempt === maxRetries) throw err;
      const jitter = Math.random() * 200;
      const delay = baseDelayMs * 2 ** attempt + jitter;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
