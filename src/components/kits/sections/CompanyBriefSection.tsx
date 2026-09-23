"use client";

import { useState } from "react";
import type { Kit } from "@/server/validation/kitSchema";
import type { EditState } from "@/server/builder/editState";
import { useEditBriefMutation, usePinBriefMutation, useUnpinBriefMutation, useRegenerateBriefMutation } from "@/lib/api/kitsApi";
import { Card } from "@/components/ui/Card";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { PinButton } from "@/components/ui/PinButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SectionHeading } from "./SectionHeading";
import { EditStateBadge } from "./EditStateBadge";
import { RegenerateButton } from "./RegenerateButton";

type ApiErrorShape = { data?: { error?: { code?: string } } };

export const CompanyBriefSection = ({
  kitId,
  source,
  brief,
  editState,
}: {
  kitId: string;
  source: Kit["source"];
  brief: Kit["company_brief"];
  editState: EditState;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [whatTheyDo, setWhatTheyDo] = useState(brief.what_they_do);
  const [summary, setSummary] = useState(brief.summary);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  const [editBrief, { isLoading: isSaving }] = useEditBriefMutation();
  const [pinBrief] = usePinBriefMutation();
  const [unpinBrief] = useUnpinBriefMutation();
  const [regenerateBrief, { isLoading: isRegenerating }] = useRegenerateBriefMutation();

  const handleSave = async () => {
    await editBrief({ id: kitId, what_they_do: whatTheyDo, summary }).unwrap();
    setIsEditing(false);
  };

  // RegenerateButton already asked "regenerate?" once. If the brief is also
  // manually edited, overwriting hand-written prose is a second, more destructive
  // question — asked with our own ConfirmDialog, not a native window.confirm.
  const handleRegenerate = async () => {
    try {
      await regenerateBrief({ id: kitId }).unwrap();
    } catch (err) {
      const code = (err as ApiErrorShape)?.data?.error?.code;
      if (code === "CONFIRMATION_REQUIRED") setConfirmingOverwrite(true);
    }
  };

  return (
    <Card className="p-6 mb-6">
      <SectionHeading
        action={
          <div className="flex items-center gap-2">
            <EditStateBadge state={editState} />
            <RegenerateButton
              onClick={handleRegenerate}
              isLoading={isRegenerating}
              confirmMessage="This replaces the company brief with a freshly generated one. Continue?"
            />
            <PinButton inline pinned={editState === "pinned"} onClick={() => (editState === "pinned" ? unpinBrief(kitId) : pinBrief(kitId))} />
          </div>
        }
      >
        <span className={source.company ? "capitalize" : ""}>{source.company || "Company"}</span>
      </SectionHeading>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          <TextAreaField label="What they do" rows={2} value={whatTheyDo} onChange={(e) => setWhatTheyDo(e.target.value)} />
          <TextAreaField label="Summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} />
          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} disabled={isSaving} className="!px-3 !py-1.5 text-xs">Save</Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)} className="!px-3 !py-1.5 text-xs">Cancel</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-foreground leading-relaxed mb-3">{brief.what_they_do}</p>
          <p className="text-sm text-muted leading-relaxed">{brief.summary}</p>
          <IconButton label="Edit" onClick={() => setIsEditing(true)} className="mt-2" />
        </>
      )}

      {brief.sources.length > 0 && (
        <p className="text-xs text-muted mt-4 pt-4 border-t border-border truncate">Sources: {brief.sources.join(", ")}</p>
      )}

      {confirmingOverwrite && (
        <ConfirmDialog
          title="Overwrite your edits?"
          message="This brief has manual edits. Regenerating replaces them with freshly generated content — your changes will be lost."
          confirmLabel="Overwrite"
          danger
          onConfirm={() => {
            setConfirmingOverwrite(false);
            regenerateBrief({ id: kitId, force: true });
          }}
          onCancel={() => setConfirmingOverwrite(false)}
        />
      )}
    </Card>
  );
};
