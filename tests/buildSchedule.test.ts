import { describe, it, expect } from "vitest";
import { buildSchedule } from "../src/server/scheduler/buildSchedule";
import type { Requirement, Question } from "../src/server/validation/kitSchema";

const req = (id: string, priority: "must" | "nice"): Requirement => ({
  id,
  text: `requirement ${id}`,
  kind: "technical",
  priority,
});

const q = (id: string, requirement_ids: string[], difficulty: 1 | 2 | 3 = 1): Question => ({
  id,
  requirement_ids,
  category: "technical",
  prompt: "p",
  answer_outline: "a",
  difficulty,
});

describe("buildSchedule", () => {
  it("produces exactly `days` entries", () => {
    const requirements = [req("r1", "must")];
    const questions = [q("q1", ["r1"]), q("q2", ["r1"]), q("q3", ["r1"])];
    const { days } = buildSchedule(requirements, questions, 3);
    expect(days).toHaveLength(3);
    expect(days.map((d) => d.day)).toEqual([1, 2, 3]);
  });

  it("every must-have requirement's question appears somewhere in the schedule", () => {
    const requirements = [req("r1", "must"), req("r2", "must")];
    const questions = [q("q1", ["r1"]), q("q2", ["r2"])];
    const { days } = buildSchedule(requirements, questions, 2);
    const scheduledQuestionIds = new Set(days.flatMap((d) => d.question_ids));
    expect(scheduledQuestionIds.has("q1")).toBe(true);
    expect(scheduledQuestionIds.has("q2")).toBe(true);
  });

  it("every question_ids entry refers to a real question", () => {
    const requirements = [req("r1", "must")];
    const questions = [q("q1", ["r1"]), q("q2", ["r1"])];
    const { days } = buildSchedule(requirements, questions, 2);
    const realIds = new Set(questions.map((q) => q.id));
    for (const day of days) {
      for (const qid of day.question_ids) expect(realIds.has(qid)).toBe(true);
    }
  });

  it("minutes is always an integer", () => {
    const requirements = [req("r1", "must")];
    const questions = [q("q1", ["r1"]), q("q2", ["r1"]), q("q3", ["r1"])];
    const { days } = buildSchedule(requirements, questions, 2);
    for (const day of days) expect(Number.isInteger(day.minutes)).toBe(true);
  });

  it("clamps days=0 or negative to 1 day, doesn't crash", () => {
    const { days_available, days } = buildSchedule([req("r1", "must")], [q("q1", ["r1"])], 0);
    expect(days_available).toBe(1);
    expect(days).toHaveLength(1);
  });

  it("handles a 60-day request without crashing or producing extra days", () => {
    const requirements = [req("r1", "must")];
    const questions = [q("q1", ["r1"])];
    const { days_available, days } = buildSchedule(requirements, questions, 60);
    expect(days_available).toBe(60);
    expect(days).toHaveLength(60);
  });

  it("harder/must-have material is weighted into earlier days", () => {
    const requirements = [req("r1", "must"), req("r2", "nice")];
    const questions = [
      q("hard1", ["r1"], 3),
      q("hard2", ["r1"], 3),
      q("easy1", ["r2"], 1),
      q("easy2", ["r2"], 1),
    ];
    const { days } = buildSchedule(requirements, questions, 2);
    expect(days[0].question_ids).toContain("hard1");
    expect(days[0].question_ids).toContain("hard2");
  });
});
