"use client";

import { useState } from "react";
import type { Flashcard } from "@/server/validation/kitSchema";
import type { EditState } from "@/server/builder/editState";
import { useEditFlashcardMutation, useDeleteFlashcardMutation, usePinFlashcardMutation } from "@/lib/api/kitsApi";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { EditStateBadge } from "./EditStateBadge";

export const FlashcardItem = ({ kitId, card, editState }: { kitId: string; card: Flashcard; editState: EditState | undefined }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  const [editFlashcard, { isLoading: isSaving }] = useEditFlashcardMutation();
  const [deleteFlashcard] = useDeleteFlashcardMutation();
  const [pinFlashcard] = usePinFlashcardMutation();

  const handleSave = async () => {
    await editFlashcard({ id: kitId, fid: card.id, front, back }).unwrap();
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="text-sm border border-border rounded-lg p-3.5 flex flex-col gap-2">
        <TextField label="Front" value={front} onChange={(e) => setFront(e.target.value)} />
        <TextField label="Back" value={back} onChange={(e) => setBack(e.target.value)} />
        <div className="flex gap-2">
          <Button type="button" onClick={handleSave} disabled={isSaving} className="!px-3 !py-1.5 text-xs">Save</Button>
          <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="!px-3 !py-1.5 text-xs">Cancel</Button>
        </div>
      </li>
    );
  }

  return (
    <li className="text-sm border border-border rounded-lg p-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-foreground">{card.front}</p>
        <EditStateBadge state={editState} />
      </div>
      <p className="text-muted mt-1.5 leading-relaxed">{card.back}</p>
      <div className="flex gap-1 mt-2">
        <IconButton label="Edit" onClick={() => setIsEditing(true)} />
        <IconButton label="Delete" onClick={() => deleteFlashcard({ id: kitId, fid: card.id })} />
        <IconButton label={editState === "pinned" ? "Unpin" : "Pin"} onClick={() => pinFlashcard({ id: kitId, fid: card.id })} />
      </div>
    </li>
  );
};
