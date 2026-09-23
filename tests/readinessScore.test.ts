import { describe, it, expect } from "vitest";
import { computeReadinessScore } from "../src/server/practice/readinessScore";
import type { Requirement, Question, Flashcard } from "../src/server/validation/kitSchema";

const req = (id: string, priority: "must" | "nice"): Requirement => ({ id, text: id, kind: "technical", priority });
const q = (id: string, requirement_ids: string[]): Question => ({ id, requirement_ids, category: "technical", prompt: "p", answer_outline: "a", difficulty: 1 });
const card = (id: string, requirement_ids: string[]): Flashcard => ({ id, front: id, back: id, requirement_ids });

describe("computeReadinessScore", () => {
  it("scores an uncovered requirement with no flashcards at 0", () => {
    const result = computeReadinessScore([req("r1", "must")], [], [], {});
    expect(result.byRequirement.r1.score).toBe(0);
    expect(result.byRequirement.r1.hasFlashcards).toBe(false);
  });

  it("scores a covered requirement with no flashcards at 100 (nothing to have practiced)", () => {
    const result = computeReadinessScore([req("r1", "must")], [q("q1", ["r1"])], [], {});
    expect(result.byRequirement.r1.score).toBe(100);
  });

  it("blends coverage and confidence when flashcards exist", () => {
    const result = computeReadinessScore(
      [req("r1", "must")],
      [q("q1", ["r1"])],
      [card("f1", ["r1"])],
      { f1: 5 }
    );
    // covered (100) * 0.4 + confidence 5/5=100 * 0.6 = 100
    expect(result.byRequirement.r1.score).toBe(100);
    expect(result.byRequirement.r1.avgConfidence).toBe(5);
  });

  it("treats a never-answered flashcard as zero confidence, not skipped", () => {
    const result = computeReadinessScore([req("r1", "must")], [q("q1", ["r1"])], [card("f1", ["r1"])], {});
    // covered (100) * 0.4 + confidence 0 * 0.6 = 40
    expect(result.byRequirement.r1.score).toBe(40);
    expect(result.byRequirement.r1.avgConfidence).toBeNull();
  });

  it("weights must-have requirements double toward the overall score", () => {
    const requirements = [req("must-req", "must"), req("nice-req", "nice")];
    // must-req: uncovered (0). nice-req: covered (100).
    const result = computeReadinessScore(requirements, [q("q1", ["nice-req"])], [], {});
    // weighted: (0*2 + 100*1) / (2+1) = 33.33 -> rounds to 33
    expect(result.overall).toBe(33);
  });

  it("returns 100 overall for a kit with no requirements at all", () => {
    const result = computeReadinessScore([], [], [], {});
    expect(result.overall).toBe(100);
  });

  it("averages multiple flashcards linked to the same requirement", () => {
    const result = computeReadinessScore(
      [req("r1", "must")],
      [q("q1", ["r1"])],
      [card("f1", ["r1"]), card("f2", ["r1"])],
      { f1: 5, f2: 3 }
    );
    expect(result.byRequirement.r1.avgConfidence).toBe(4);
  });
});
