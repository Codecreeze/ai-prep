import type { Flashcard } from "../validation/kitSchema";

export type ConfidenceMap = Record<string, number>; // flashcard id -> 1 (least confident) .. 5 (most confident)

// Confidence-weighted sort, per the brief's own framing ("a simple confidence-
// weighted sort is fine; a proper spaced-repetition interval is fine — pick one and
// defend it"). Chosen over a spaced-repetition interval scheduler because this app
// has no notion of session dates/intervals yet — a full SM-2-style algorithm needs
// review-date tracking this data model doesn't have, and would be speculative
// complexity for a "days until interview" prep tool where cramming the weakest
// material *now*, not spreading it over calendar days, is the actual goal.
//
// Never-answered cards rank as least confident of all (confidence 0), so a first
// practice session naturally starts with everything unseen, in original kit order;
// a repeat session leads with whatever the user rated lowest last time.
export function orderNextSession(flashcards: Flashcard[], confidence: ConfidenceMap): Flashcard[] {
  const weight = (card: Flashcard) => confidence[card.id] ?? 0;
  return [...flashcards].sort((a, b) => weight(a) - weight(b));
}
