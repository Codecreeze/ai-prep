"use client";

import { useState } from "react";
import { Sun, Moon } from "lucide-react";
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
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </Tooltip>
  );
};
