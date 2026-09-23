"use client";

import { useAppDispatch } from "@/lib/hooks";
import { toggleSidebar } from "@/lib/uiSlice";
import { Tooltip } from "@/components/ui/Tooltip";

const ToggleIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4.5">
    <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2.75 9.25a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75z" clipRule="evenodd" />
  </svg>
);

export const SidebarToggle = () => {
  const dispatch = useAppDispatch();
  return (
    <Tooltip label="Toggle sidebar">
      <button
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        aria-label="Toggle sidebar"
        className="hidden md:grid size-8 place-items-center rounded-lg text-muted hover:text-foreground hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ToggleIcon />
      </button>
    </Tooltip>
  );
};
