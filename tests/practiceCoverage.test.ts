import { describe, it, expect } from "vitest";
import { computePracticeCoverage } from "../src/server/practice/practiceCoverage";
import type { Flashcard } from "../src/server/validation/kitSchema";

const card = (id: string, requirement_ids: string[]): Flashcard => ({ id, front: id, back: id, requirement_ids });

describe("computePracticeCoverage", () => {
  it("counts covered vs total overall", () => {
    const cards = [card("a", ["r1"]), card("b", ["r2"]), card("c", ["r1"])];
    const result = computePracticeCoverage(cards, ["a"]);
    expect(result.coveredCount).toBe(1);
    expect(result.totalCount).toBe(3);
  });

  it("breaks coverage down per requirement", () => {
    const cards = [card("a", ["r1"]), card("b", ["r1"]), card("c", ["r2"])];
    const result = computePracticeCoverage(cards, ["a"]);
    expect(result.byRequirement.r1).toEqual({ covered: 1, total: 2 });
    expect(result.byRequirement.r2).toEqual({ covered: 0, total: 1 });
  });

  it("a card covering multiple requirements counts toward each", () => {
    const cards = [card("a", ["r1", "r2"])];
    const result = computePracticeCoverage(cards, ["a"]);
    expect(result.byRequirement.r1.covered).toBe(1);
    expect(result.byRequirement.r2.covered).toBe(1);
  });

  it("handles zero flashcards without crashing", () => {
    const result = computePracticeCoverage([], []);
    expect(result).toEqual({ coveredCount: 0, totalCount: 0, byRequirement: {} });
  });
});
