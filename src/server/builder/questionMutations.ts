import type { Kit, Question } from "../validation/kitSchema";
import { checkCoverage } from "../coverage/checkCoverage";
import { nextItemId } from "./nextItemId";
import { markEdited, markHandWritten, type KitEditState } from "./editState";

type Result = { kit: Kit; editState: KitEditState };

// Coverage is a snapshot derived from requirements+questions — recomputed after any
// change that could add/remove a question, since a deleted question can uncover a
// requirement and an added one can cover a gap. Never left stale.
const withRecomputedCoverage = (kit: Kit): Kit => ({
  ...kit,
  coverage: { ...kit.coverage, uncovered_requirement_ids: checkCoverage(kit.role.requirements, kit.questions) },
});

export const addQuestion = (
  kit: Kit,
  editState: KitEditState,
  input: Omit<Question, "id">
): Result => {
  const id = nextItemId("q", kit.questions.map((q) => q.id));
  const question: Question = { id, ...input };
  const kitWithQuestion = withRecomputedCoverage({ ...kit, questions: [...kit.questions, question] });
  return { kit: kitWithQuestion, editState: { ...editState, questions: { ...editState.questions, [id]: markHandWritten() } } };
};

export const editQuestion = (kit: Kit, editState: KitEditState, id: string, updates: Partial<Omit<Question, "id">>): Result => {
  const questions = kit.questions.map((q) => (q.id === id ? { ...q, ...updates } : q));
  const kitUpdated = withRecomputedCoverage({ ...kit, questions });
  return { kit: kitUpdated, editState: { ...editState, questions: { ...editState.questions, [id]: markEdited(editState.questions[id]) } } };
};

export const deleteQuestion = (kit: Kit, editState: KitEditState, id: string): Result => {
  const questions = kit.questions.filter((q) => q.id !== id);
  const kitUpdated = withRecomputedCoverage({ ...kit, questions });
  const { [id]: _removed, ...restQuestionState } = editState.questions;
  return { kit: kitUpdated, editState: { ...editState, questions: restQuestionState } };
};

export const moveQuestionCategory = (kit: Kit, editState: KitEditState, id: string, toCategory: Question["category"]): Result => {
  const questions = kit.questions.map((q) => (q.id === id ? { ...q, category: toCategory } : q));
  return { kit: { ...kit, questions }, editState: { ...editState, questions: { ...editState.questions, [id]: markEdited(editState.questions[id]) } } };
};

/** Reorders items within one category; positions of other categories' questions are untouched. */
export const reorderQuestionsInCategory = (kit: Kit, editState: KitEditState, category: Question["category"], orderedIds: string[]): Result => {
  const byId = new Map(kit.questions.map((q) => [q.id, q]));
  const reordered = orderedIds.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q));
  let cursor = 0;
  const questions = kit.questions.map((q) => (q.category === category ? reordered[cursor++] : q));
  return { kit: { ...kit, questions }, editState };
};

export const pinQuestion = (kit: Kit, editState: KitEditState, id: string): Result => ({
  kit,
  editState: { ...editState, questions: { ...editState.questions, [id]: "pinned" } },
});

// Unpinning drops back to "generated" (not "edited") — pin/unpin only tracks
// protection status here, not edit history, so unpinning removes protection
// entirely rather than leaving it half-protected as "edited". If the user wants it
// protected again after further changes, editing it re-marks it "edited" naturally.
export const unpinQuestion = (kit: Kit, editState: KitEditState, id: string): Result => ({
  kit,
  editState: { ...editState, questions: { ...editState.questions, [id]: "generated" } },
});
