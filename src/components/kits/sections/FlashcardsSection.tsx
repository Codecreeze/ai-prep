import type { Kit } from "@/server/validation/kitSchema";
import type { KitEditState } from "@/server/builder/editState";
import { Card } from "@/components/ui/Card";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { SectionHeading } from "./SectionHeading";
import { FlashcardItem } from "./FlashcardItem";
import { AddFlashcardForm } from "./AddFlashcardForm";

export const FlashcardsSection = ({ kitId, flashcards, editState }: { kitId: string; flashcards: Kit["flashcards"]; editState: KitEditState }) => (
  <Card className="p-6 mb-6">
    <SectionHeading>Flashcards ({flashcards.length})</SectionHeading>
    <ul className="grid gap-3 sm:grid-cols-2 mb-3">
      {flashcards.map((card) => (
        <ErrorBoundary key={card.id}>
          <FlashcardItem kitId={kitId} card={card} editState={editState.flashcards[card.id]} />
        </ErrorBoundary>
      ))}
    </ul>
    <AddFlashcardForm kitId={kitId} />
  </Card>
);
