import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { assertUrlIsSafe } from "../src/server/retrieval/urlValidator";

describe("assertUrlIsSafe", () => {
  const originalFlag = process.env.ALLOW_LOCAL_URLS;
  afterEach(() => {
    process.env.ALLOW_LOCAL_URLS = originalFlag;
  });

  it("rejects an unparsable URL", async () => {
    await expect(assertUrlIsSafe("not a url")).rejects.toThrow(/INVALID_URL/);
  });

  it("rejects a non-http(s) protocol", async () => {
    process.env.ALLOW_LOCAL_URLS = "true";
    await expect(assertUrlIsSafe("ftp://example.com")).rejects.toThrow(/INVALID_URL/);
  });

  it("blocks localhost when ALLOW_LOCAL_URLS is not set", async () => {
    process.env.ALLOW_LOCAL_URLS = "false";
    await expect(assertUrlIsSafe("http://localhost:8099/acme/")).rejects.toThrow(/SSRF_BLOCKED/);
  });

  it("allows localhost when ALLOW_LOCAL_URLS=true (batch/dev mode)", async () => {
    process.env.ALLOW_LOCAL_URLS = "true";
    const url = await assertUrlIsSafe("http://localhost:8099/acme/");
    expect(url.hostname).toBe("localhost");
  });

  it("blocks a private IPv4 literal in production mode", async () => {
    process.env.ALLOW_LOCAL_URLS = "false";
    await expect(assertUrlIsSafe("http://127.0.0.1/")).rejects.toThrow(/SSRF_BLOCKED|localhost/);
  });
});
