"use client";

import { useState } from "react";
import { CommandPalette } from "./CommandPalette";

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 text-muted shrink-0">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

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
        <SearchIcon />
        <span className="text-sm">Search kits by role or company...</span>
      </button>
      {open && <CommandPalette onClose={() => setOpen(false)} />}
    </>
  );
};
