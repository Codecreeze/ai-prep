import { z } from "zod";
import { generateJSON, withUntrustedContent } from "../llm/client";
import { makeIdGenerator } from "./ids";
import type { Question, Flashcard } from "../validation/kitSchema";

const FlashcardsSchema = z.object({
  flashcards: z.array(z.object({ front: z.string(), back: z.string() })),
});

const PROMPT = `Turn the following interview question bank into concise flashcards —
short front (the prompt/concept, not the full question) and a short back (the key
fact/answer, a few lines max, not the full answer outline).

Return JSON: { "flashcards": [{ "front": string, "back": string }] }`;

/**
 * Generates flashcards from the question bank, one LLM call for the whole set (unlike
 * questions, flashcards don't need per-requirement framing — they're a condensed
 * recall aid over material already generated, so batching keeps token usage down).
 */
export async function generateFlashcards(questions: Question[]): Promise<Flashcard[]> {
  if (!questions.length) return [];
  const nextId = makeIdGenerator("f");

  const questionText = questions.map((q) => `[${q.id}] (${q.category}) ${q.prompt} — ${q.answer_outline}`).join("\n");
  const prompt = withUntrustedContent(PROMPT, questionText);
  const result = await generateJSON(prompt, (raw) => FlashcardsSchema.parse(JSON.parse(raw)));

  // Maps each generated flashcard back to the requirement(s) of its source questions,
  // in order — deterministic pairing rather than asking the model to also emit ids.
  return result.flashcards.map((f, i) => {
    const sourceQuestion = questions[i % questions.length];
    return { id: nextId(), ...f, requirement_ids: sourceQuestion.requirement_ids };
  });
}
