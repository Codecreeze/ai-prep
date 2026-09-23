"use client";

import { useState } from "react";
import type { Question, Requirement } from "@/server/validation/kitSchema";
import { useAddQuestionMutation } from "@/lib/api/kitsApi";
import { Button } from "@/components/ui/Button";
import { TextAreaField } from "@/components/ui/TextAreaField";

export const AddQuestionForm = ({ kitId, category, requirements }: { kitId: string; category: Question["category"]; requirements: Requirement[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [answerOutline, setAnswerOutline] = useState("");
  const [addQuestion, { isLoading }] = useAddQuestionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addQuestion({
      id: kitId,
      category,
      prompt,
      answer_outline: answerOutline,
      difficulty: 2,
      requirement_ids: requirements.map((r) => r.id), // hand-added questions default to covering all requirements; user can narrow later by editing
    }).unwrap();
    setPrompt("");
    setAnswerOutline("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-xs font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
      >
        + Add a question
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border border-border rounded-lg p-3">
      <TextAreaField label="Question" required rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
      <TextAreaField label="Answer outline" rows={2} value={answerOutline} onChange={(e) => setAnswerOutline(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="!px-3 !py-1.5 text-xs">Add</Button>
        <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="!px-3 !py-1.5 text-xs">Cancel</Button>
      </div>
    </form>
  );
};
