import { describe, it, expect } from "vitest";
import { paginationRange } from "../src/lib/paginationRange";

describe("paginationRange", () => {
  it("shows every page when there are few enough", () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("matches the reference pattern: 1 2 [3] ... 100", () => {
    expect(paginationRange(3, 100)).toEqual([1, 2, 3, 4, "ellipsis", 100]);
  });

  it("collapses both sides when current page is in the middle", () => {
    expect(paginationRange(50, 100)).toEqual([1, "ellipsis", 49, 50, 51, "ellipsis", 100]);
  });

  it("has no leading ellipsis when current page is near the start", () => {
    const result = paginationRange(1, 20);
    expect(result[0]).toBe(1);
    expect(result.filter((t) => t === "ellipsis")).toHaveLength(1);
  });

  it("has no trailing ellipsis when current page is near the end", () => {
    const result = paginationRange(20, 20);
    expect(result[result.length - 1]).toBe(20);
    expect(result.filter((t) => t === "ellipsis")).toHaveLength(1);
  });
});
