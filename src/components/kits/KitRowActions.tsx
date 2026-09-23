"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

// A row-level kebab menu (Show/Practice/Delete) instead of a single bare "Delete"
// link — matches the reference table's action-column pattern and leaves room for
// more row actions later without redesigning the column. "Practice" only makes
// sense once flashcards exist, so it's hidden for pending/failed kits.
export const KitRowActions = ({ kitId, status, onDelete }: { kitId: string; status: "pending" | "ready" | "failed"; onDelete: () => void }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="relative inline-block">
      <Tooltip label="Actions" align="end">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Row actions"
          aria-expanded={open}
          className="size-8 grid place-items-center rounded-lg text-muted hover:text-foreground hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <MoreVertical className="size-4" />
        </button>
      </Tooltip>
      {open && (
        <>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-30 cursor-default" />
          <div className="absolute right-0 mt-1 w-36 bg-surface border border-border rounded-lg shadow-lg z-40 py-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push(`/dashboard/kits/${kitId}`);
              }}
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background"
            >
              Show
            </button>
            {status === "ready" && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/dashboard/practice/${kitId}`);
                }}
                className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-background"
              >
                Practice
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};
