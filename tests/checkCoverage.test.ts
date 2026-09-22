import { describe, it, expect } from "vitest";
import { checkCoverage } from "../src/server/coverage/checkCoverage";
import type { Requirement, Question } from "../src/server/validation/kitSchema";

const req = (id: string, priority: "must" | "nice"): Requirement => ({
  id,
  text: `requirement ${id}`,
  kind: "technical",
  priority,
});

const q = (id: string, requirement_ids: string[]): Question => ({
  id,
  requirement_ids,
  category: "technical",
  prompt: "p",
  answer_outline: "a",
  difficulty: 1,
});

describe("checkCoverage", () => {
  it("returns empty when every must-have is covered", () => {
    const requirements = [req("r1", "must"), req("r2", "must")];
    const questions = [q("q1", ["r1"]), q("q2", ["r2"])];
    expect(checkCoverage(requirements, questions)).toEqual([]);
  });

  it("returns the uncovered must-have id", () => {
    const requirements = [req("r1", "must"), req("r2", "must")];
    const questions = [q("q1", ["r1"])];
    expect(checkCoverage(requirements, questions)).toEqual(["r2"]);
  });

  it("ignores uncovered nice-to-haves", () => {
    const requirements = [req("r1", "must"), req("r2", "nice")];
    const questions = [q("q1", ["r1"])];
    expect(checkCoverage(requirements, questions)).toEqual([]);
  });

  it("a question covering multiple requirements clears all of them", () => {
    const requirements = [req("r1", "must"), req("r2", "must")];
    const questions = [q("q1", ["r1", "r2"])];
    expect(checkCoverage(requirements, questions)).toEqual([]);
  });

  it("returns every must-have when there are no questions at all", () => {
    const requirements = [req("r1", "must"), req("r2", "must")];
    expect(checkCoverage(requirements, [])).toEqual(["r1", "r2"]);
  });
});
