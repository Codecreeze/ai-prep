"use client";

import { PanelLeft } from "lucide-react";
import { useAppDispatch } from "@/lib/hooks";
import { toggleSidebar } from "@/lib/uiSlice";
import { Tooltip } from "@/components/ui/Tooltip";

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
        <PanelLeft className="size-4.5" />
      </button>
    </Tooltip>
  );
};
