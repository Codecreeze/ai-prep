// Token-bucket limiter for outbound LLM calls. Free tiers throttle requests-per-minute
// AND tokens-per-minute — this caps request rate; token pressure is handled by
// withRetry's backoff reacting to the provider's actual 429s, since token cost per
// call varies and isn't known until the response comes back.
export class RateLimiter {
  private tokens: number;
  private readonly max: number;
  private readonly refillMs: number;
  private lastRefill = Date.now();

  constructor(maxPerMinute: number) {
    this.max = maxPerMinute;
    this.tokens = maxPerMinute;
    this.refillMs = 60_000;
  }

  private refill() {
    const elapsed = Date.now() - this.lastRefill;
    if (elapsed <= 0) return;
    const refillAmount = (elapsed / this.refillMs) * this.max;
    this.tokens = Math.min(this.max, this.tokens + refillAmount);
    this.lastRefill = Date.now();
  }

  /** Resolves once a call slot is available, waiting if the bucket is empty. */
  async acquire(): Promise<void> {
    for (;;) {
      this.refill();
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      const waitMs = ((1 - this.tokens) / this.max) * this.refillMs;
      await new Promise((r) => setTimeout(r, Math.max(50, waitMs)));
    }
  }
}
