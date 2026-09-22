import { describe, it, expect, vi } from "vitest";
import { withRetry } from "../src/server/llm/withRetry";

describe("withRetry", () => {
  it("returns the result immediately on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn, { baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on a rate-limit error and eventually succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 Too Many Requests"))
      .mockResolvedValueOnce("ok");
    const result = await withRetry(fn, { baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("gives up after maxRetries and rethrows the last error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("quota exceeded"));
    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })).rejects.toThrow("quota exceeded");
    expect(fn).toHaveBeenCalledTimes(3); // initial attempt + 2 retries
  });

  it("does not retry a non-transient error", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("INVALID_API_KEY"));
    await expect(withRetry(fn, { baseDelayMs: 1 })).rejects.toThrow("INVALID_API_KEY");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on a 503 'briefly unavailable' provider error", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("503 Service Unavailable: high demand"))
      .mockResolvedValueOnce("ok");
    const result = await withRetry(fn, { baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
