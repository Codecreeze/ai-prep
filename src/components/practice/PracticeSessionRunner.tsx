"use client";

import { useState } from "react";
import type { Flashcard } from "@/server/validation/kitSchema";
import { useAnswerCardMutation } from "@/lib/api/practiceApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfidenceButtons } from "./ConfidenceButtons";

// Takes the session's card order as a prop and snapshots it into local state once
// (React only runs a useState initializer on first mount, not on every re-render) —
// this deliberately decouples the in-progress session from the live, confidence-
// sorted query: if the order re-derived on every render, answering a card would
// reshuffle the remaining queue mid-session, which would be disorienting.
export const PracticeSessionRunner = ({ kitId, initialFlashcards }: { kitId: string; initialFlashcards: Flashcard[] }) => {
  const [queue] = useState(initialFlashcards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answerCard] = useAnswerCardMutation();

  const handleAnswer = async (confidence: number) => {
    await answerCard({ id: kitId, cardId: queue[index].id, confidence });
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  if (queue.length === 0) {
    return <Card className="p-6 text-center text-muted text-sm">This kit has no flashcards to practice yet.</Card>;
  }

  if (index >= queue.length) {
    return (
      <Card className="p-6 text-center">
        <p className="font-medium text-foreground mb-1">Session complete</p>
        <p className="text-sm text-muted mb-4">You went through all {queue.length} flashcards.</p>
        <Button onClick={() => { setIndex(0); setRevealed(false); }}>Practice again</Button>
      </Card>
    );
  }

  const card = queue[index];

  return (
    <Card className="p-8">
      <p className="text-xs text-muted mb-4">Card {index + 1} of {queue.length}</p>
      <p className="text-lg font-medium text-foreground mb-6 min-h-12">{card.front}</p>

      {revealed ? (
        <>
          <p className="text-sm text-muted leading-relaxed mb-6 pt-4 border-t border-border">{card.back}</p>
          <ConfidenceButtons onAnswer={handleAnswer} />
        </>
      ) : (
        <Button onClick={() => setRevealed(true)}>Reveal answer</Button>
      )}
    </Card>
  );
};
