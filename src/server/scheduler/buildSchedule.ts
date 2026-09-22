import type { Question, Requirement, ScheduleDay } from "../validation/kitSchema";

const MINUTES_PER_QUESTION = 15; // fixed estimate per question, keeps output integer & simple to defend

/**
 * Deterministic schedule allocation — explicitly NOT handed to the LLM per the brief.
 * This is arithmetic: rank questions by (priority of the requirements they cover,
 * then difficulty) descending, then greedily front-load them across exactly
 * `days` buckets so harder / higher-priority material lands earlier.
 */
export function buildSchedule(
  requirements: Requirement[],
  questions: Question[],
  days: number
): { days_available: number; days: ScheduleDay[] } {
  const safeDays = Math.max(1, Math.min(60, Math.floor(days) || 1));
  const requirementById = new Map(requirements.map((r) => [r.id, r]));

  const weight = (q: Question) => {
    const coversAnyMust = q.requirement_ids.some((rid) => requirementById.get(rid)?.priority === "must");
    return (coversAnyMust ? 1000 : 0) + q.difficulty * 10;
  };

  const ranked = [...questions].sort((a, b) => weight(b) - weight(a));

  // Bucket round-robin over `safeDays`, but because `ranked` is sorted hardest-first,
  // day 1 gets the first (hardest) slice, day 2 the next, etc. — this guarantees
  // must-have material clusters in earlier days rather than being scattered evenly.
  const buckets: Question[][] = Array.from({ length: safeDays }, () => []);
  const perDay = Math.ceil(ranked.length / safeDays) || 1;
  ranked.forEach((q, i) => {
    const dayIndex = Math.min(safeDays - 1, Math.floor(i / perDay));
    buckets[dayIndex].push(q);
  });

  const usedTopics = new Set<string>();
  const days_ = buckets.map((bucket, idx) => {
    const topics = bucket
      .flatMap((q) => q.requirement_ids)
      .map((rid) => requirementById.get(rid)?.text)
      .filter((t): t is string => Boolean(t));
    const uniqueTopics = [...new Set(topics)];
    uniqueTopics.forEach((t) => usedTopics.add(t));
    const focus = uniqueTopics.length
      ? uniqueTopics.slice(0, 3).join("; ")
      : idx === 0
        ? "General review"
        : "Review and practice";
    return {
      day: idx + 1,
      focus,
      question_ids: bucket.map((q) => q.id),
      minutes: bucket.length * MINUTES_PER_QUESTION,
    };
  });

  return { days_available: safeDays, days: days_ };
}
