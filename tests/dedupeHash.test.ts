import { describe, it, expect } from "vitest";
import { computeDedupeHash } from "../src/server/persistence/dedupeHash";

describe("computeDedupeHash", () => {
  it("produces the same hash for identical jd+companyUrl", () => {
    const a = computeDedupeHash("Some JD text", "https://acme.com");
    const b = computeDedupeHash("Some JD text", "https://acme.com");
    expect(a).toBe(b);
  });

  it("is case- and whitespace-insensitive", () => {
    const a = computeDedupeHash("Some JD Text", "https://ACME.com");
    const b = computeDedupeHash("  some jd text  ", "https://acme.com ");
    expect(a).toBe(b);
  });

  it("produces a different hash for different input", () => {
    const a = computeDedupeHash("JD one", "https://acme.com");
    const b = computeDedupeHash("JD two", "https://acme.com");
    expect(a).not.toBe(b);
  });
});
