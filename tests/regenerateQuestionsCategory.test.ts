import { describe, it, expect, vi } from "vitest";
import type { Kit, Requirement, Question } from "../src/server/validation/kitSchema";
import { emptyEditState } from "../src/server/builder/editState";

vi.mock("../src/server/generation/generateQuestions", () => ({
  generateQuestionsFor: vi.fn(async (requirement: Requirement, category: Question["category"], nextId: () => string) => [
    {
      id: nextId(),
      requirement_ids: [requirement.id],
      category,
      prompt: `fresh question for ${requirement.id}`,
      answer_outline: "fresh outline",
      difficulty: 1,
    },
  ]),
}));

const { regenerateQuestionsCategory } = await import("../src/server/builder/regenerateQuestionsCategory");

const req = (id: string): Requirement => ({ id, text: id, kind: "technical", priority: "must" });
const q = (id: string, requirement_ids: string[], category: Question["category"] = "technical"): Question => ({
  id,
  requirement_ids,
  category,
  prompt: `original ${id}`,
  answer_outline: "original outline",
  difficulty: 1,
});

const baseKit = (): Kit => ({
  source: { company: "Acme", company_url: "http://x", role: "", location: "", jd_chars: 0, researched_at: "", pages_used: [] },
  company_brief: { summary: "", what_they_do: "", sources: [] },
  role: { title: "", seniority: "", responsibilities: [], requirements: [req("r1"), req("r2"), req("r3")] },
  questions: [q("q1", ["r1"]), q("q2", ["r2"]), q("q3", ["r3"])],
  flashcards: [],
  schedule: { days_available: 1, days: [{ day: 1, focus: "", question_ids: [], minutes: 0 }] },
  coverage: { uncovered_requirement_ids: [], passes: 1 },
});

describe("regenerateQuestionsCategory", () => {
  it("replaces a plain 'generated' question but keeps an 'edited' one untouched", async () => {
    const kit = baseKit();
    const editState = { ...emptyEditState(), questions: { q1: "generated" as const, q2: "edited" as const, q3: "generated" as const } };

    const { kit: updated, editState: newEditState } = await regenerateQuestionsCategory(kit, editState, "technical");

    // q2 (edited) survives with its original content, unchanged.
    const q2 = updated.questions.find((x) => x.id === "q2");
    expect(q2?.prompt).toBe("original q2");
    expect(newEditState.questions.q2).toBe("edited");

    // q1 and q3 (both plain "generated") are gone, replaced by fresh generations.
    expect(updated.questions.find((x) => x.id === "q1")).toBeUndefined();
    expect(updated.questions.find((x) => x.id === "q3")).toBeUndefined();
  });

  it("keeps a 'pinned' question untouched and does not regenerate for its requirement", async () => {
    const kit = baseKit();
    const editState = { ...emptyEditState(), questions: { q1: "pinned" as const, q2: "generated" as const, q3: "generated" as const } };

    const { kit: updated } = await regenerateQuestionsCategory(kit, editState, "technical");

    const q1 = updated.questions.find((x) => x.id === "q1");
    expect(q1?.prompt).toBe("original q1");
    // No fresh question was generated covering r1, since q1 (pinned) already covers it.
    const freshForR1 = updated.questions.filter((x) => x.requirement_ids.includes("r1") && x.id !== "q1");
    expect(freshForR1).toHaveLength(0);
  });

  it("does not touch questions in a different category", async () => {
    const kit: Kit = { ...baseKit(), questions: [q("q1", ["r1"]), q("qb", ["r2"], "behavioural")] };
    const editState = { ...emptyEditState(), questions: { q1: "generated" as const } };

    const { kit: updated } = await regenerateQuestionsCategory(kit, editState, "technical");

    expect(updated.questions.find((x) => x.id === "qb")).toBeDefined();
    expect(updated.questions.find((x) => x.id === "qb")?.prompt).toBe("original qb");
  });

  it("recomputes coverage after regeneration", async () => {
    const kit = baseKit();
    const editState = { ...emptyEditState(), questions: { q1: "generated" as const, q2: "generated" as const, q3: "generated" as const } };
    const { kit: updated } = await regenerateQuestionsCategory(kit, editState, "technical");
    expect(updated.coverage.uncovered_requirement_ids).toEqual([]);
  });
});
