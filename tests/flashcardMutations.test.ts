import { describe, it, expect } from "vitest";
import { addFlashcard, editFlashcard, deleteFlashcard, pinFlashcard, unpinFlashcard } from "../src/server/builder/flashcardMutations";
import { emptyEditState } from "../src/server/builder/editState";
import type { Kit, Flashcard } from "../src/server/validation/kitSchema";

const f = (id: string): Flashcard => ({ id, front: `front ${id}`, back: `back ${id}`, requirement_ids: [] });

const baseKit = (): Kit => ({
  source: { company: "", company_url: "", role: "", location: "", jd_chars: 0, researched_at: "", pages_used: [] },
  company_brief: { summary: "", what_they_do: "", sources: [] },
  role: { title: "", seniority: "", responsibilities: [], requirements: [] },
  questions: [],
  flashcards: [f("f1")],
  schedule: { days_available: 1, days: [] },
  coverage: { uncovered_requirement_ids: [], passes: 1 },
});

describe("flashcard mutations", () => {
  it("addFlashcard assigns a new id and marks hand-written", () => {
    const { kit, editState } = addFlashcard(baseKit(), emptyEditState(), { front: "a", back: "b", requirement_ids: [] });
    expect(kit.flashcards).toHaveLength(2);
    expect(editState.flashcards.f2).toBe("edited");
  });

  it("editFlashcard updates content and marks edited", () => {
    const { kit, editState } = editFlashcard(baseKit(), emptyEditState(), "f1", { front: "changed" });
    expect(kit.flashcards[0].front).toBe("changed");
    expect(editState.flashcards.f1).toBe("edited");
  });

  it("deleteFlashcard removes it and its edit-state entry", () => {
    const stateWithEdit = { ...emptyEditState(), flashcards: { f1: "edited" as const } };
    const { kit, editState } = deleteFlashcard(baseKit(), stateWithEdit, "f1");
    expect(kit.flashcards).toHaveLength(0);
    expect(editState.flashcards.f1).toBeUndefined();
  });

  it("pin then unpin round-trips to generated", () => {
    const { editState: pinned } = pinFlashcard(baseKit(), emptyEditState(), "f1");
    expect(pinned.flashcards.f1).toBe("pinned");
    const { editState: unpinned } = unpinFlashcard(baseKit(), pinned, "f1");
    expect(unpinned.flashcards.f1).toBe("generated");
  });
});
