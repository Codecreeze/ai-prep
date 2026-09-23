import { describe, it, expect } from "vitest";
import { orderNextSession } from "../src/server/practice/orderNextSession";
import type { Flashcard } from "../src/server/validation/kitSchema";

const card = (id: string): Flashcard => ({ id, front: `front ${id}`, back: `back ${id}`, requirement_ids: [] });

describe("orderNextSession", () => {
  it("puts never-answered cards first, in original order", () => {
    const cards = [card("a"), card("b"), card("c")];
    const ordered = orderNextSession(cards, {});
    expect(ordered.map((c) => c.id)).toEqual(["a", "b", "c"]);
  });

  it("orders answered cards by ascending confidence (least confident first)", () => {
    const cards = [card("high"), card("low"), card("mid")];
    const confidence = { high: 5, low: 1, mid: 3 };
    const ordered = orderNextSession(cards, confidence);
    expect(ordered.map((c) => c.id)).toEqual(["low", "mid", "high"]);
  });

  it("ranks an unanswered card ahead of even the lowest-confidence answered card", () => {
    const cards = [card("answered-low"), card("never-answered")];
    const confidence = { "answered-low": 1 };
    const ordered = orderNextSession(cards, confidence);
    expect(ordered.map((c) => c.id)).toEqual(["never-answered", "answered-low"]);
  });

  it("does not mutate the input array", () => {
    const cards = [card("a"), card("b")];
    orderNextSession(cards, { a: 5, b: 1 });
    expect(cards.map((c) => c.id)).toEqual(["a", "b"]);
  });
});
