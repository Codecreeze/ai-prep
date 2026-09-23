import type { Kit, Flashcard } from "../validation/kitSchema";
import { nextItemId } from "./nextItemId";
import { markEdited, markHandWritten, type KitEditState } from "./editState";

type Result = { kit: Kit; editState: KitEditState };

export const addFlashcard = (kit: Kit, editState: KitEditState, input: Omit<Flashcard, "id">): Result => {
  const id = nextItemId("f", kit.flashcards.map((f) => f.id));
  const flashcard: Flashcard = { id, ...input };
  return {
    kit: { ...kit, flashcards: [...kit.flashcards, flashcard] },
    editState: { ...editState, flashcards: { ...editState.flashcards, [id]: markHandWritten() } },
  };
};

export const editFlashcard = (kit: Kit, editState: KitEditState, id: string, updates: Partial<Omit<Flashcard, "id">>): Result => ({
  kit: { ...kit, flashcards: kit.flashcards.map((f) => (f.id === id ? { ...f, ...updates } : f)) },
  editState: { ...editState, flashcards: { ...editState.flashcards, [id]: markEdited(editState.flashcards[id]) } },
});

export const deleteFlashcard = (kit: Kit, editState: KitEditState, id: string): Result => {
  const { [id]: _removed, ...restFlashcardState } = editState.flashcards;
  return { kit: { ...kit, flashcards: kit.flashcards.filter((f) => f.id !== id) }, editState: { ...editState, flashcards: restFlashcardState } };
};

export const pinFlashcard = (kit: Kit, editState: KitEditState, id: string): Result => ({
  kit,
  editState: { ...editState, flashcards: { ...editState.flashcards, [id]: "pinned" } },
});

export const unpinFlashcard = (kit: Kit, editState: KitEditState, id: string): Result => ({
  kit,
  editState: { ...editState, flashcards: { ...editState.flashcards, [id]: "generated" } },
});
