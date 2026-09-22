import { describe, it, expect } from "vitest";
import { makeIdGenerator } from "../src/server/generation/ids";

describe("makeIdGenerator", () => {
  it("produces sequential, prefixed ids starting at 1", () => {
    const nextId = makeIdGenerator("r");
    expect(nextId()).toBe("r1");
    expect(nextId()).toBe("r2");
    expect(nextId()).toBe("r3");
  });

  it("independent generators don't share counters", () => {
    const a = makeIdGenerator("q");
    const b = makeIdGenerator("q");
    a();
    a();
    expect(b()).toBe("q1");
  });
});
