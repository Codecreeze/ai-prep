"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type RegenerateButtonProps = {
  onClick: () => void;
  isLoading: boolean;
  label?: string;
  confirmMessage?: string;
};

// Regenerating replaces generated content — every caller across the app goes
// through this same confirm step rather than firing on a single click, so a
// misclick can't silently discard work.
export const RegenerateButton = ({
  onClick,
  isLoading,
  label = "Regenerate",
  confirmMessage = "This replaces any generated content in this section that you haven't edited or pinned. Continue?",
}: RegenerateButtonProps) => {
  const [confirming, setConfirming] = useState(false);

  return (
    <>
      <Button type="button" variant="secondary" onClick={() => setConfirming(true)} disabled={isLoading} className="!px-3 !py-1.5 text-xs">
        {isLoading && <Spinner className="size-3.5" />}
        {isLoading ? "Regenerating..." : label}
      </Button>
      {confirming && (
        <ConfirmDialog
          title="Regenerate?"
          message={confirmMessage}
          confirmLabel="Regenerate"
          onConfirm={() => {
            setConfirming(false);
            onClick();
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  );
};
