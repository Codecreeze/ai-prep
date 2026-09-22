import type { Question, Requirement } from "../validation/kitSchema";

/**
 * Deterministic coverage check — explicitly NOT handed to the LLM per the brief.
 * A "must" requirement with zero questions referencing its id is a gap.
 * "nice" requirements don't block coverage (they're bonus, not blocking).
 */
export function checkCoverage(requirements: Requirement[], questions: Question[]): string[] {
  const covered = new Set<string>();
  for (const q of questions) {
    for (const rid of q.requirement_ids) covered.add(rid);
  }
  return requirements
    .filter((r) => r.priority === "must")
    .filter((r) => !covered.has(r.id))
    .map((r) => r.id);
}
