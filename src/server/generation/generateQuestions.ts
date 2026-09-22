import { z } from "zod";
import { generateJSON, withUntrustedContent } from "../llm/client";
import { makeIdGenerator } from "./ids";
import type { Question, Requirement } from "../validation/kitSchema";

const QuestionsSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string(),
      answer_outline: z.string(),
      difficulty: z.number().int().min(1).max(3),
    })
  ),
});

// Category-specific instructions — a technical requirement and a behavioural one
// genuinely need different framing, so each call uses its own template rather than
// one generic "write interview questions" prompt for every category.
const CATEGORY_INSTRUCTIONS: Record<Question["category"], string> = {
  technical: "Write hands-on technical interview questions that test real working knowledge, not trivia.",
  behavioural: "Write behavioural questions (STAR-style) that probe how the candidate has actually acted in relevant past situations.",
  "system-design": "Write a system-design question that requires designing/reasoning about an architecture relevant to this requirement.",
  "company-fit": "Write a question assessing motivation/fit for a role needing this, without generic 'why do you want to work here' filler.",
};

function buildPrompt(requirement: Requirement, category: Question["category"], count: number): string {
  const instructions = `${CATEGORY_INSTRUCTIONS[category]}

Generate exactly ${count} question(s) for this specific requirement, in the "${category}" category.
Each needs a concise model "answer_outline" (bullet-style guidance, not a full essay) and a
"difficulty" from 1 (easy) to 3 (hard).

Return JSON: { "questions": [{ "prompt": string, "answer_outline": string, "difficulty": 1|2|3 }] }`;
  return withUntrustedContent(instructions, `REQUIREMENT: ${requirement.text} (priority: ${requirement.priority})`);
}

/**
 * Generates questions for one (requirement, category) pairing — a separate LLM call
 * per pairing, per the brief: "a requirement like five years of React leads to
 * technical questions while mentoring junior engineers leads to behavioural ones;
 * the two should not come from the same call with the same instructions."
 */
export async function generateQuestionsFor(
  requirement: Requirement,
  category: Question["category"],
  nextId: () => string,
  count = 1
): Promise<Question[]> {
  const prompt = buildPrompt(requirement, category, count);
  const result = await generateJSON(prompt, (raw) => QuestionsSchema.parse(JSON.parse(raw)));
  return result.questions.map((q) => ({
    id: nextId(),
    requirement_ids: [requirement.id],
    category,
    ...q,
  }));
}

export function createQuestionIdGenerator() {
  return makeIdGenerator("q");
}
