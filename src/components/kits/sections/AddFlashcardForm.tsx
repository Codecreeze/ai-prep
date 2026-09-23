"use client";

import { useState } from "react";
import { useAddFlashcardMutation } from "@/lib/api/kitsApi";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

export const AddFlashcardForm = ({ kitId }: { kitId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [addFlashcard, { isLoading }] = useAddFlashcardMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addFlashcard({ id: kitId, front, back, requirement_ids: [] }).unwrap();
    setFront("");
    setBack("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        + Add a flashcard
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border border-border rounded-lg p-3 sm:col-span-2">
      <TextField label="Front" required value={front} onChange={(e) => setFront(e.target.value)} />
      <TextField label="Back" required value={back} onChange={(e) => setBack(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="!px-3 !py-1.5 text-xs">Add</Button>
        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="!px-3 !py-1.5 text-xs">Cancel</Button>
      </div>
    </form>
  );
};
