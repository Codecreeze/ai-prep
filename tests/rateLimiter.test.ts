import { describe, it, expect } from "vitest";
import { RateLimiter } from "../src/server/llm/rateLimiter";

describe("RateLimiter", () => {
  it("allows immediate acquisition up to the per-minute max", async () => {
    const limiter = new RateLimiter(3);
    const start = Date.now();
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
    expect(Date.now() - start).toBeLessThan(200); // 3 tokens available immediately, no wait
  });
});
