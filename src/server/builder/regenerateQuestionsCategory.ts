import type { Kit, Question, Requirement } from "../validation/kitSchema";
import { categoriesFor } from "../generation/categoryRouter";
import { generateQuestionsFor } from "../generation/generateQuestions";
import { checkCoverage } from "../coverage/checkCoverage";
import { makeContinuingIdGenerator } from "./nextItemId";
import type { KitEditState } from "./editState";

/**
 * Regenerates one question category without discarding edits — the brief's
 * explicit hardest requirement. Algorithm:
 *   1. Split existing questions in this category into "protected" (edited/pinned —
 *      survive untouched) and "generated" (safe to replace).
 *   2. Figure out which requirements this category still needs new questions for:
 *      every requirement the category router says applies to this category, MINUS
 *      any requirement a protected question in this category already covers (so a
 *      requirement the user hand-wrote a question for isn't given a redundant
 *      second, freshly-generated one).
 *   3. Generate fresh questions only for that remaining set.
 *   4. Rebuild kit.questions as [everything NOT in this category] + [protected] +
 *      [newly generated] — every other category's questions and their positions
 *      are completely untouched.
 * Coverage is recomputed afterward since the question set changed.
 */
export async function regenerateQuestionsCategory(
  kit: Kit,
  editState: KitEditState,
  category: Question["category"]
): Promise<{ kit: Kit; editState: KitEditState }> {
  const existingInCategory = kit.questions.filter((q) => q.category === category);
  const protectedQuestions = existingInCategory.filter((q) => editState.questions[q.id] !== "generated");
  const protectedRequirementIds = new Set(protectedQuestions.flatMap((q) => q.requirement_ids));

  const needsGeneration = (r: Requirement) => categoriesFor(r).includes(category) && !protectedRequirementIds.has(r.id);
  const requirementsToFill = kit.role.requirements.filter(needsGeneration);

  const nextId = makeContinuingIdGenerator("q", kit.questions.map((q) => q.id));
  const batches = await Promise.all(requirementsToFill.map((req) => generateQuestionsFor(req, category, nextId)));
  const freshlyGenerated = batches.flat();

  const questions = [
    ...kit.questions.filter((q) => q.category !== category),
    ...protectedQuestions,
    ...freshlyGenerated,
  ];

  const questionEditState = { ...editState.questions };
  // Drop state entries for old "generated" questions in this category that no longer exist.
  for (const q of existingInCategory) {
    if (editState.questions[q.id] === "generated") delete questionEditState[q.id];
  }
  for (const q of freshlyGenerated) questionEditState[q.id] = "generated";

  const updatedKit: Kit = { ...kit, questions };
  return {
    kit: { ...updatedKit, coverage: { ...kit.coverage, uncovered_requirement_ids: checkCoverage(kit.role.requirements, questions) } },
    editState: { ...editState, questions: questionEditState },
  };
}
