"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { CommandPalette } from "./CommandPalette";

// A button that LOOKS like a search box (matching the topbar's usual search-input
// placement) but opens the full command palette on click, rather than being a live
// text input itself — matches the requested "click to open a command palette" pattern.
export const CommandPaletteTrigger = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Search"
        className="hidden sm:flex items-center gap-2 flex-1 max-w-xs px-3 py-1.5 rounded-lg border border-border bg-background text-muted hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Search className="size-4 text-muted shrink-0" />
        <span className="text-sm">Search kits by role or company...</span>
      </button>
      {open && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  );
};
