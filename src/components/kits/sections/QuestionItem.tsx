"use client";

import { useState } from "react";
import type { Question } from "@/server/validation/kitSchema";
import type { EditState } from "@/server/builder/editState";
import {
  useEditQuestionMutation,
  useDeleteQuestionMutation,
  useMoveQuestionMutation,
  usePinQuestionMutation,
  useUnpinQuestionMutation,
} from "@/lib/api/kitsApi";
import { IconButton } from "@/components/ui/IconButton";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { Button } from "@/components/ui/Button";
import { EditStateBadge } from "./EditStateBadge";

const CATEGORIES: Question["category"][] = ["technical", "behavioural", "system-design", "company-fit"];

export const QuestionItem = ({ kitId, question, editState }: { kitId: string; question: Question; editState: EditState | undefined }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(question.prompt);
  const [answerOutline, setAnswerOutline] = useState(question.answer_outline);

  const [editQuestion, { isLoading: isSaving }] = useEditQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [moveQuestion] = useMoveQuestionMutation();
  const [pinQuestion] = usePinQuestionMutation();
  const [unpinQuestion] = useUnpinQuestionMutation();

  const handleSave = async () => {
    await editQuestion({ id: kitId, qid: question.id, prompt, answer_outline: answerOutline }).unwrap();
    setIsEditing(false);
  };

  const handleCancel = () => {
    setPrompt(question.prompt);
    setAnswerOutline(question.answer_outline);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="text-sm border-l-2 border-primary pl-4">
        <TextAreaField label="Question" rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="mb-2" />
        <TextAreaField label="Answer outline" rows={3} value={answerOutline} onChange={(e) => setAnswerOutline(e.target.value)} />
        <div className="flex gap-2 mt-2">
          <Button type="button" onClick={handleSave} disabled={isSaving} className="!px-3 !py-1.5 text-xs">
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={handleCancel} className="!px-3 !py-1.5 text-xs">
            Cancel
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="text-sm border-l-2 border-primary/30 pl-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-foreground">{question.prompt}</p>
        <EditStateBadge state={editState} />
      </div>
      <p className="text-muted mt-1.5 leading-relaxed">{question.answer_outline}</p>
      <div className="flex flex-wrap items-center gap-1 mt-2">
        <IconButton label="Edit" onClick={() => setIsEditing(true)} />
        <IconButton label="Delete" onClick={() => deleteQuestion({ id: kitId, qid: question.id })} />
        <IconButton
          label={editState === "pinned" ? "Unpin" : "Pin"}
          onClick={() => (editState === "pinned" ? unpinQuestion({ id: kitId, qid: question.id }) : pinQuestion({ id: kitId, qid: question.id }))}
        />
        <select
          value={question.category}
          onChange={(e) => moveQuestion({ id: kitId, qid: question.id, toCategory: e.target.value as Question["category"] })}
          aria-label="Move to category"
          className="text-xs border border-border rounded px-1.5 py-0.5 bg-surface text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </li>
  );
};
