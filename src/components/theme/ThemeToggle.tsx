"use client";

import { useState } from "react";
import { applyTheme, isDarkActive } from "@/lib/theme";
import { Tooltip } from "@/components/ui/Tooltip";

// Lazy useState initializer reads the DOM/localStorage synchronously on first
// client render — by then themeInitScript (in layout.tsx's <head>) has already run,
// so this matches the real applied theme without needing an effect to sync it
// after the fact. suppressHydrationWarning covers the one-render gap between the
// server's theme-less markup and the client's real value, the same pattern
// next-themes itself uses.
export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => isDarkActive());

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    setIsDark(!isDark);
  };

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Tooltip label={label}>
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        suppressHydrationWarning
        className="size-8 grid place-items-center rounded-lg border border-border text-muted hover:text-foreground hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {isDark ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.24 2.34a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM4.34 4.34a1 1 0 011.41 1.41l-.7.71A1 1 0 013.63 5.05l.7-.71zM3 9a1 1 0 110 2H2a1 1 0 110-2h1zm1.34 6.66a1 1 0 011.41-1.41l-.7.7a1 1 0 01-1.42-1.41l.71-.7zM10 15a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm4.95.95a1 1 0 001.41-1.41l-.7-.71a1 1 0 10-1.42 1.42l.71.7zM10 6a4 4 0 100 8 4 4 0 000-8z" /></svg>
        ) : (
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
        )}
      </button>
    </Tooltip>
  );
};
