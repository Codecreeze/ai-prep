import type { Flashcard } from "../validation/kitSchema";

export type PracticeCoverage = {
  coveredCount: number;
  totalCount: number;
  byRequirement: Record<string, { covered: number; total: number }>;
};

/** Summarizes practice progress: how many flashcards have been seen overall, and per requirement. */
export function computePracticeCoverage(flashcards: Flashcard[], coveredCardIds: string[]): PracticeCoverage {
  const covered = new Set(coveredCardIds);
  const byRequirement: PracticeCoverage["byRequirement"] = {};

  for (const card of flashcards) {
    for (const reqId of card.requirement_ids) {
      const entry = (byRequirement[reqId] ??= { covered: 0, total: 0 });
      entry.total += 1;
      if (covered.has(card.id)) entry.covered += 1;
    }
  }

  return {
    coveredCount: flashcards.filter((c) => covered.has(c.id)).length,
    totalCount: flashcards.length,
    byRequirement,
  };
}
