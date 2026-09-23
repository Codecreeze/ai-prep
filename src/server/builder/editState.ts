export type EditState = "generated" | "edited" | "pinned";

export type KitEditState = {
  questions: Record<string, EditState>;
  flashcards: Record<string, EditState>;
  brief: EditState;
  schedule: EditState;
};

export const emptyEditState = (): KitEditState => ({
  questions: {},
  flashcards: {},
  brief: "generated",
  schedule: "generated",
});

// A hand-written item is never "generated" — it has no LLM origin to protect it from,
// so treating it as "edited" is what makes it survive a category regeneration.
const HAND_WRITTEN: EditState = "edited";

/** Marks an item as user-modified, unless it's already pinned (pinned outranks edited). */
export const markEdited = (current: EditState | undefined): EditState => (current === "pinned" ? "pinned" : "edited");

export const markHandWritten = (): EditState => HAND_WRITTEN;
