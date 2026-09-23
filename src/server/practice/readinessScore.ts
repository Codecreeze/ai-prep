import type { Flashcard, Question, Requirement } from "../validation/kitSchema";
import type { ConfidenceMap } from "./orderNextSession";

export type ReadinessEntry = {
  priority: Requirement["priority"];
  hasCoverage: boolean;
  hasFlashcards: boolean;
  avgConfidence: number | null; // 1-5, null if no flashcards answered for this requirement
  score: number; // 0-100
};

export type ReadinessScore = {
  overall: number; // 0-100, priority-weighted
  byRequirement: Record<string, ReadinessEntry>;
};

const MUST_WEIGHT = 2;
const NICE_WEIGHT = 1;
const COVERAGE_WEIGHT_WHEN_PRACTICED = 0.4;
const CONFIDENCE_WEIGHT_WHEN_PRACTICED = 0.6;

/**
 * The creative feature: a single "how ready am I for this interview" number,
 * derived by combining two signals the app already computes separately for other
 * purposes — coverage (does a question exist for this requirement) and practice
 * confidence (how the user actually rated themselves on flashcards testing it) —
 * rather than just displaying either alone. See devlog for the full reasoning.
 *
 * Per requirement:
 *   - No flashcards exist for it yet -> score is pure coverage (0 or 100): there's
 *     nothing to have practiced, so confidence can't penalize it.
 *   - Flashcards exist -> score blends coverage (a question exists at all) with how
 *     confident the user actually felt (a card never answered counts as 0
 *     confidence, same "not ready yet" treatment as orderNextSession.ts uses).
 * `must` requirements count double toward the overall score, `nice` count once —
 * a kit that's weak on a must-have should visibly drag the number down more than a
 * weak nice-to-have.
 */
export function computeReadinessScore(
  requirements: Requirement[],
  questions: Question[],
  flashcards: Flashcard[],
  confidence: ConfidenceMap
): ReadinessScore {
  const byRequirement: Record<string, ReadinessEntry> = {};
  let weightedSum = 0;
  let totalWeight = 0;

  for (const req of requirements) {
    const hasCoverage = questions.some((q) => q.requirement_ids.includes(req.id));
    const linkedCards = flashcards.filter((f) => f.requirement_ids.includes(req.id));
    const hasFlashcards = linkedCards.length > 0;

    let score: number;
    let avgConfidence: number | null = null;

    if (!hasFlashcards) {
      score = hasCoverage ? 100 : 0;
    } else {
      const ratings = linkedCards.map((c) => confidence[c.id] ?? 0);
      avgConfidence = ratings.some((r) => r > 0) ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
      const confidenceComponent = ((avgConfidence ?? 0) / 5) * 100;
      const coverageComponent = hasCoverage ? 100 : 0;
      score = COVERAGE_WEIGHT_WHEN_PRACTICED * coverageComponent + CONFIDENCE_WEIGHT_WHEN_PRACTICED * confidenceComponent;
    }

    byRequirement[req.id] = { priority: req.priority, hasCoverage, hasFlashcards, avgConfidence, score };

    const weight = req.priority === "must" ? MUST_WEIGHT : NICE_WEIGHT;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 100;
  return { overall, byRequirement };
}
