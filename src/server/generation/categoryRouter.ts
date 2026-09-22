import type { Requirement, Question } from "../validation/kitSchema";

// Decides which question categories are worth generating for a given requirement,
// instead of blindly doing the full requirement x category cross-product — bounds
// LLM call volume (matters for free-tier rate limits) and avoids nonsense pairings
// like a system-design question forced out of "familiarity with Jira".
export function categoriesFor(requirement: Requirement): Question["category"][] {
  if (requirement.kind === "behavioural") return ["behavioural", "company-fit"];
  if (requirement.kind === "domain") return ["company-fit", "technical"];
  // technical
  return requirement.priority === "must" ? ["technical", "system-design"] : ["technical"];
}
