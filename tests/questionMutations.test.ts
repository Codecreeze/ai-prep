import { describe, it, expect } from "vitest";
import {
  addQuestion,
  editQuestion,
  deleteQuestion,
  moveQuestionCategory,
  reorderQuestionsInCategory,
  pinQuestion,
  unpinQuestion,
} from "../src/server/builder/questionMutations";
import { emptyEditState } from "../src/server/builder/editState";
import type { Kit, Requirement, Question } from "../src/server/validation/kitSchema";

const req = (id: string, priority: "must" | "nice" = "must"): Requirement => ({ id, text: id, kind: "technical", priority });
const q = (id: string, requirement_ids: string[], category: Question["category"] = "technical"): Question => ({
  id,
  requirement_ids,
  category,
  prompt: `prompt ${id}`,
  answer_outline: "outline",
  difficulty: 1,
});

const baseKit = (): Kit => ({
  source: { company: "Acme", company_url: "http://x", role: "", location: "", jd_chars: 0, researched_at: "", pages_used: [] },
  company_brief: { summary: "", what_they_do: "", sources: [] },
  role: { title: "", seniority: "", responsibilities: [], requirements: [req("r1"), req("r2")] },
  questions: [q("q1", ["r1"]), q("q2", ["r2"])],
  flashcards: [],
  schedule: { days_available: 1, days: [{ day: 1, focus: "", question_ids: [], minutes: 0 }] },
  coverage: { uncovered_requirement_ids: [], passes: 1 },
});

describe("addQuestion", () => {
  it("assigns a new id and marks it as hand-written (edited)", () => {
    const kit = baseKit();
    const { kit: updated, editState } = addQuestion(kit, emptyEditState(), {
      requirement_ids: ["r1"],
      category: "technical",
      prompt: "new",
      answer_outline: "o",
      difficulty: 1,
    });
    expect(updated.questions).toHaveLength(3);
    const newQ = updated.questions[2];
    expect(newQ.id).toBe("q3");
    expect(editState.questions[newQ.id]).toBe("edited");
  });
});

describe("editQuestion", () => {
  it("updates fields and marks generated -> edited", () => {
    const kit = baseKit();
    const { kit: updated, editState } = editQuestion(kit, emptyEditState(), "q1", { prompt: "changed" });
    expect(updated.questions.find((x) => x.id === "q1")?.prompt).toBe("changed");
    expect(editState.questions.q1).toBe("edited");
  });

  it("keeps pinned status when editing a pinned question", () => {
    const kit = baseKit();
    const pinnedState = { ...emptyEditState(), questions: { q1: "pinned" as const } };
    const { editState } = editQuestion(kit, pinnedState, "q1", { prompt: "changed" });
    expect(editState.questions.q1).toBe("pinned");
  });
});

describe("deleteQuestion", () => {
  it("removes the question and recomputes coverage to include the now-uncovered requirement", () => {
    const kit = baseKit();
    const { kit: updated } = deleteQuestion(kit, emptyEditState(), "q2");
    expect(updated.questions.map((x) => x.id)).toEqual(["q1"]);
    expect(updated.coverage.uncovered_requirement_ids).toContain("r2");
  });
});

describe("moveQuestionCategory", () => {
  it("changes category and marks edited", () => {
    const kit = baseKit();
    const { kit: updated, editState } = moveQuestionCategory(kit, emptyEditState(), "q1", "behavioural");
    expect(updated.questions.find((x) => x.id === "q1")?.category).toBe("behavioural");
    expect(editState.questions.q1).toBe("edited");
  });
});

describe("reorderQuestionsInCategory", () => {
  it("reorders only the given category, leaving other categories' positions alone", () => {
    const kit: Kit = { ...baseKit(), questions: [q("a", ["r1"]), q("b", ["r1"]), q("x", ["r2"], "behavioural")] };
    const { kit: updated } = reorderQuestionsInCategory(kit, emptyEditState(), "technical", ["b", "a"]);
    expect(updated.questions.map((x) => x.id)).toEqual(["b", "a", "x"]);
  });
});

describe("pin/unpin", () => {
  it("pin sets pinned, unpin drops to generated", () => {
    const kit = baseKit();
    const { editState: pinned } = pinQuestion(kit, emptyEditState(), "q1");
    expect(pinned.questions.q1).toBe("pinned");
    const { editState: unpinned } = unpinQuestion(kit, pinned, "q1");
    expect(unpinned.questions.q1).toBe("generated");
  });
});
